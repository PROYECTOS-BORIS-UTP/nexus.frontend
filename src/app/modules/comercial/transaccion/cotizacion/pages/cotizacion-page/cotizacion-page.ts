import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, tap, catchError, of, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { ICotizacionListadoRequest } from '../../interfaces/request/ICotizacionListadoRequest.interface';
import { ICotizacionResponse } from '../../interfaces/response/ICotizacionResponse.interface';
import { CotizacionService } from '../../services/cotizacion.service';
import { ICotizacionDeleteResponse } from '../../interfaces/response/ICotizacionDeleteResponse.interface';
import { ICotizacionCreateUpdateRequest } from '../../interfaces/request/ICotizacionCreateUpdateRequest.interface';
import { CotizacionForm } from './dialogs/cotizacion-form/cotizacion-form';

@Component({
	selector: 'app-cotizacion-page',
	imports: [
		CommonModule,
		DatePipe,
		MatTableModule,
		MatProgressBarModule,
		MatChipsModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatInputModule,
		MatDialogModule,
		MatTooltipModule,
		MatSnackBarModule,
		TableGeneric
	],
	templateUrl: './cotizacion-page.html',
	styleUrl: './cotizacion-page.scss'
})
export class CotizacionPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private cotizacionService = inject(CotizacionService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<ICotizacionResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<ICotizacionResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumeroCotizacion', 'dFechaEmision', 'vClienteNombre', 'nTotal', 'dFechaVencimiento', 'iIdEstado'];
	selection = new SelectionModel<ICotizacionResponse>(true, []);
	cotizacionActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Cotización', icon: 'edit' },
		{ name: 'delete', label: 'Anular Cotización', icon: 'cancel' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarCotizaciones();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarCotizaciones(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: ICotizacionListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vNumeroCotizacion: this.currentFilterValue || undefined,
			// Podríamos filtrar por Cliente también si el backend lo soporta con el mismo campo o lógica separada
		};

		this.cotizacionService.listarCotizacion(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar cotizaciones:', error);
				this.data.set([]);
				this.totalRecords.set(0);
				return of(null);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe();
	}
	// #endregion

	// #region Manejo de Paginación
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarCotizaciones();
	}
	// #endregion

	// #region Manejo de Filtro
	private setupFilterSubscription(): void {
		this.filterSubscription = this.filterSubject.pipe(
			debounceTime(400),
			distinctUntilChanged()
		).subscribe(filterValue => {
			this.currentFilterValue = filterValue;
			// Reset pagination
			this.currentPageIndex = 0;
			if (this.tableGeneric) {
				this.tableGeneric.resetPaginator();
			}
			this.cargarCotizaciones();
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterSubject.next(filterValue.trim());
	}
	// #endregion

	// #region Lógica de Selección de Filas
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.data().length;
		return numSelected === numRows && numRows > 0;
	}

	toggleAllRows(): void {
		this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
	}
	// #endregion

	// #region Manejo de Acciones de Fila
	onActionClicked(event: { action: string, element: ICotizacionResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditCotizacion(event.element);
				break;
			case 'delete':
				this.onDeleteCotizacion(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddCotizacion(): void {
		const dialogRef = this.dialog.open(CotizacionForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarCotizaciones();
			}
		});
	}

	onEditCotizacion(cotizacion: ICotizacionResponse): void {
		const dataParaForm: ICotizacionCreateUpdateRequest = {
			iIdCotizacion: cotizacion.iIdCotizacion,
			iIdCompania: cotizacion.iIdCompania,
			iIdCliente: cotizacion.iIdCliente,
			vNumeroCotizacion: cotizacion.vNumeroCotizacion,
			dFechaEmision: (cotizacion.dFechaEmision as any),
			dFechaVencimiento: (cotizacion.dFechaVencimiento as any),
			iIdMoneda: cotizacion.iIdMoneda,
			nTipoCambio: 0, // No está en el Response de lista, se cargará en el form o default
			nSubTotal: 0, // Ídem
			nIGV: 0, // Ídem
			nTotal: cotizacion.nTotal,
			iIdEstado: cotizacion.iIdEstado,
			bActivo: cotizacion.bActivo
		};

		const dialogRef = this.dialog.open(CotizacionForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: { cotizacion: dataParaForm }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarCotizaciones();
			}
		});
	}

	onDeleteCotizacion(cotizacion: ICotizacionResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Anulación',
				mensaje: `¿Estás seguro de ANULAR la Cotización "${cotizacion.vNumeroCotizacion}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.cotizacionService.eliminarCotizacion({ iIdCotizacion: cotizacion.iIdCotizacion }).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: ICotizacionDeleteResponse) => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarCotizaciones();
					}
				});
			}
		});
	}
	// #endregion
}
