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
import { IOrdenCompraListadoRequest } from '../../interfaces/request/IOrdenCompraListadoRequest.interface';
import { IOrdenCompraResponse } from '../../interfaces/response/IOrdenCompraResponse.interface';
import { OrdenCompraService } from '../../services/orden-compra.service';
import { IOrdenCompraDeleteResponse } from '../../interfaces/response/IOrdenCompraDeleteResponse.interface';
import { IOrdenCompraCreateUpdateRequest } from '../../interfaces/request/IOrdenCompraCreateUpdateRequest.interface';
import { OrdenCompraForm } from './dialogs/orden-compra-form/orden-compra-form';

@Component({
	selector: 'app-orden-compra-page',
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
	templateUrl: './orden-compra-page.html',
	styleUrl: './orden-compra-page.scss'
})
export class OrdenCompraPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private ordenCompraService = inject(OrdenCompraService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IOrdenCompraResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IOrdenCompraResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumeroOrden', 'dFechaEmision', 'vProveedorNombre', 'nTotal', 'vLugarEntrega', 'vEstadoNombre'];
	selection = new SelectionModel<IOrdenCompraResponse>(true, []);
	ordenCompraActions: TableAction[] = [
		{ name: 'edit', label: 'Editar O.C.', icon: 'edit' },
		{ name: 'delete', label: 'Anular O.C.', icon: 'cancel' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarOrdenesCompra();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarOrdenesCompra(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IOrdenCompraListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vNumeroOrden: this.currentFilterValue || undefined,
		};

		this.ordenCompraService.listarOrdenCompra(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar órdenes de compra:', error);
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
		this.cargarOrdenesCompra();
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
			this.cargarOrdenesCompra();
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
	onActionClicked(event: { action: string, element: IOrdenCompraResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditOrdenCompra(event.element);
				break;
			case 'delete':
				this.onDeleteOrdenCompra(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddOrdenCompra(): void {
		const dialogRef = this.dialog.open(OrdenCompraForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarOrdenesCompra();
			}
		});
	}

	onEditOrdenCompra(ordenCompra: IOrdenCompraResponse): void {
		const dataParaForm: IOrdenCompraCreateUpdateRequest = {
			iIdOrdenCompra: ordenCompra.iIdOrdenCompra,
			iIdCompania: ordenCompra.iIdCompania,
			iIdProveedor: ordenCompra.iIdProveedor,
			vNumeroOrden: ordenCompra.vNumeroOrden,
			dFechaEmision: (ordenCompra.dFechaEmision as any),
			dFechaEntrega: (ordenCompra.dFechaEntrega as any),
			iIdMoneda: ordenCompra.iIdMoneda,
			nTipoCambio: ordenCompra.nTipoCambio,
			iIdFormaPago: ordenCompra.iIdFormaPago,
			nSubTotal: ordenCompra.nSubTotal,
			nIGV: ordenCompra.nIGV,
			nTotal: ordenCompra.nTotal,
			vObservacion: ordenCompra.vObservacion,
			vLugarEntrega: ordenCompra.vLugarEntrega,
			iIdEstado: ordenCompra.iIdEstado,
			bActivo: ordenCompra.bActivo
		};

		const dialogRef = this.dialog.open(OrdenCompraForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: { ordenCompra: dataParaForm }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarOrdenesCompra();
			}
		});
	}

	onDeleteOrdenCompra(ordenCompra: IOrdenCompraResponse): void {
		// TODO: Validar estado si es necesario
		// if (ordenCompra.iIdEstado !== ESTADO_PENDIENTE) { ... }

		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Anulación',
				mensaje: `¿Estás seguro de ANULAR la Orden de Compra "${ordenCompra.vNumeroOrden}"?`,
				mostrarCampoObservacion: false // O true si se requiere motivo
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.ordenCompraService.eliminarOrdenCompra({ iIdOrdenCompra: ordenCompra.iIdOrdenCompra }).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: IOrdenCompraDeleteResponse) => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarOrdenesCompra();
					}
				});
			}
		});
	}
	// #endregion
}
