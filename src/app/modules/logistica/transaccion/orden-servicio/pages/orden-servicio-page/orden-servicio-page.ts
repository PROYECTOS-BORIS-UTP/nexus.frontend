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
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { IOrdenServicioListadoRequest } from '../../interfaces/request/IOrdenServicioListadoRequest.interface';
import { IOrdenServicioResponse } from '../../interfaces/response/IOrdenServicioResponse.interface';
import { OrdenServicioService } from '../../services/orden-servicio.service';
import { IOrdenServicioDeleteResponse } from '../../interfaces/response/IOrdenServicioDeleteResponse.interface';
import { OrdenServicioForm } from './dialogs/orden-servicio-form/orden-servicio-form';
import { IOrdenServicioCreateUpdateRequest } from '../../interfaces/request/IOrdenServicioCreateUpdateRequest.interface';

@Component({
	selector: 'app-orden-servicio-page',
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
		TableGeneric,
		MatDialogModule,
		MatTooltipModule,
		MatSnackBarModule,
		MatPaginatorModule,
		EstadoGeneral
	],
	templateUrl: './orden-servicio-page.html',
	styleUrl: './orden-servicio-page.scss'
})
export class OrdenServicioPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private ordenServicioService = inject(OrdenServicioService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IOrdenServicioResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IOrdenServicioResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumeroOrden', 'dFechaEmision', 'vProveedorNombre', 'nTotal', 'iIdEstado'];
	selection = new SelectionModel<IOrdenServicioResponse>(true, []);
	ordenServicioActions: TableAction[] = [
		{ name: 'edit', label: 'Editar O.S.', icon: 'edit' },
		{ name: 'delete', label: 'Anular O.S.', icon: 'cancel' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarOrdenesServicio();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarOrdenesServicio(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IOrdenServicioListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vNumeroOrden: this.currentFilterValue || undefined,
		};

		this.ordenServicioService.listarOrdenServicio(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar órdenes de servicio:', error);
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
		this.cargarOrdenesServicio();
	}
	// #endregion

	// #region Manejo de Filtro
	private setupFilterSubscription(): void {
		this.filterSubscription = this.filterSubject.pipe(
			debounceTime(400),
			distinctUntilChanged()
		).subscribe(filterValue => {
			this.currentFilterValue = filterValue;
			this.tableGeneric?.resetPaginator();
			this.currentPageIndex = 0;
			this.cargarOrdenesServicio();
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
	onActionClicked(event: { action: string, element: IOrdenServicioResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditOrdenServicio(event.element);
				break;
			case 'delete':
				this.onDeleteOrdenServicio(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddOrdenServicio(): void {
		const dialogRef = this.dialog.open(OrdenServicioForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarOrdenesServicio();
			}
		});
	}

	onEditOrdenServicio(ordenServicio: IOrdenServicioResponse): void {
		const dataParaForm: IOrdenServicioCreateUpdateRequest = {
			iIdOrdenServicio: ordenServicio.iIdOrdenServicio,
			iIdCompania: ordenServicio.iIdCompania,
			iIdProveedor: ordenServicio.iIdProveedor,
			vNumeroOrden: ordenServicio.vNumeroOrden,
			dFechaEmision: (ordenServicio.dFechaEmision as any),
			dFechaInicio: (ordenServicio.dFechaInicio as any),
			dFechaFin: (ordenServicio.dFechaFin as any),
			iIdMoneda: ordenServicio.iIdMoneda,
			nTipoCambio: ordenServicio.nTipoCambio,
			iIdFormaPago: ordenServicio.iIdFormaPago,
			nSubTotal: ordenServicio.nSubTotal,
			nIGV: ordenServicio.nIGV,
			nTotal: ordenServicio.nTotal,
			vObservacion: ordenServicio.vObservacion,
			iIdEstado: ordenServicio.iIdEstado,
			bActivo: ordenServicio.bActivo
		};

		const dialogRef = this.dialog.open(OrdenServicioForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: { ordenServicio: dataParaForm }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarOrdenesServicio();
			}
		});
	}

	onDeleteOrdenServicio(ordenServicio: IOrdenServicioResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Anulación',
				mensaje: `¿Estás seguro de ANULAR la Orden de Servicio "${ordenServicio.vNumeroOrden}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.ordenServicioService.eliminarOrdenServicio({ iIdOrdenServicio: ordenServicio.iIdOrdenServicio }).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: IOrdenServicioDeleteResponse) => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarOrdenesServicio();
					}
				});
			}
		});
	}
	// #endregion
}
