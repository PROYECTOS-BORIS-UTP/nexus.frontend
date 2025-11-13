import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, Input, signal, SimpleChanges, ViewChild } from '@angular/core';
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
import { Subscription, tap, catchError, of, finalize } from 'rxjs';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { MovimientosService } from '../../services/movimientos.service';
import { MovimientoForm } from './dialogs/movimiento-form/movimiento-form';
import { IMovimientoListadoRequest } from '../../interfaces/request/IMovimientoListadoRequest.interface';
import { IMovimientoResponse } from '../../interfaces/response/IMovimientoResponse.interface';
import { IAlmacenResponse } from '../../../../mantenimiento/almacen/interfaces/response/IAlmacenResponse.interface';
import { AlmacenService } from '../../../../mantenimiento/almacen/services/almacen.service';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ISelectItem } from '../../../../../../core/interfaces/ISelectItem.interface';
import { IAlmacenListadoRequest } from '../../../../mantenimiento/almacen/interfaces/request/IAlmacenListadoRequest.interface';

@Component({
	selector: 'app-movimientos-page',
	imports: [
		CommonModule,
		FormsModule,
		DatePipe,
		DecimalPipe,
		MatTableModule,
		MatSelectModule,
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
	templateUrl: './movimientos-page.html',
	styleUrl: './movimientos-page.scss'
})
export class MovimientosPage {
	// #region Inyección de Dependencias
	private movimientosService = inject(MovimientosService);
	private almacenService = inject(AlmacenService);
	// private productoService = inject(ProductoService); // <-- AÑADIR
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	isLoadingDropdowns = signal(false); // Loading para selects
	data = signal<IMovimientoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// --- Estado para los Selects ---
	isLoadingAlmacenes = signal(false);
	isLoadingProductos = signal(false);
	selectAlmacenes = signal<ISelectItem[]>([]);
	selectProductos = signal<ISelectItem[]>([]);

	almacenIdSeleccionado = signal<number | null>(null);
	productoIdSeleccionado = signal<number | null>(null);
	// #endregion

	// ... (Referencias a Hijos, Config Tabla) ...
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IMovimientoResponse>;
	aDisplayedColumns: string[] = ['select', 'dFechaMovimiento', 'vTipoMovimientoNombre', 'dCantidad', 'dPrecioUnitario', 'dTotal', 'vObservacion', 'bActivo'];
	selection = new SelectionModel<IMovimientoResponse>(true, []);
	movimientoActions: TableAction[] = [
		{ name: 'delete', label: 'Anular Movimiento', icon: 'cancel' },
	];
	// #endregion

	// #region Filtros (Sin filtro de texto genérico)
	private subscriptions = new Subscription();
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarAlmacenes();
		this.cargarProductos();
	}

	// QUITA ngOnChanges

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
	// #endregion

	//#region LOAD SELECTS
	/*
	 * Carga la lista de Almacenes para el dropdown.
	 */
	cargarAlmacenes() {
		this.isLoadingAlmacenes.set(true);

		const request: IAlmacenListadoRequest = {
			iPageNumber: 1,
			iPageSize: 1000,
			bActivo: true
		};

		this.almacenService.listarAlmacenes(request).pipe(
			finalize(() => this.isLoadingAlmacenes.set(false))
		).subscribe({
			next: (paginatedResponse) => {
				this.selectAlmacenes.set(paginatedResponse.aRecords.map(alm => ({
					iIdElemento: alm.iIdAlmacen,
					vDescripcion: alm.vNombre
				})));
			},
			error: (err) => {
				console.error('Error al cargar Almacenes:', err);
				this.selectAlmacenes.set([]);
			}
		});
	}

	/*
	 * Carga la lista de Productos para el dropdown.
	 */
	cargarProductos() {
		this.isLoadingProductos.set(true);
		// --- LLAMADA SIMULADA (Reemplazar con this.productoService.listarProductos) ---
		// const request: IProductoListadoRequest = { iPageNumber: 1, iPageSize: 1000, bActivo: true };
		// this.productoService.listarProductos(request).pipe(...).subscribe({
		//   next: (paginatedResponse) => {
		//     this.selectProductos.set(paginatedResponse.aRecords.map(prod => ({
		//       iIdElemento: prod.iIdProducto,
		//       vDescripcion: prod.vNombre // Asumiendo que producto tiene vNombre
		//     })));
		//   }, ...
		// });

		// Simulación adaptada a ISelectItem:
		setTimeout(() => { // Simula demora de red
			this.selectProductos.set([
				{ iIdElemento: 1, vDescripcion: 'Producto A (Simulado)' },
				{ iIdElemento: 2, vDescripcion: 'Producto B (Simulado)' }
			]);
			this.isLoadingProductos.set(false);
		}, 500);
	}

	/*
	 * Obtiene los movimientos del servicio.
	 */
	cargarMovimientos(): void {
		const idAlmacen = this.almacenIdSeleccionado();
		const idProducto = this.productoIdSeleccionado();

		// Guarda si los inputs no están listos
		if (!idAlmacen || !idProducto) {
			this.data.set([]);
			this.totalRecords.set(0);
			return;
		}

		this.isLoading.set(true);
		this.selection.clear();

		const request: IMovimientoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			iIdAlmacen: idAlmacen,
			iIdProducto: idProducto,
		};

		this.movimientosService.listarMovimientos(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar movimientos:', error);
				this.data.set([]);
				this.totalRecords.set(0);
				return of(null);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe();
	}
	// #endregion

	/** Se llama cuando el usuario cambia el Almacén */
	onAlmacenChange() {
		this.productoIdSeleccionado.set(null);
		this.data.set([]); // Limpia la tabla
		this.totalRecords.set(0);
		// Aquí se podría recargar productos si dependen del almacén
	}

	/** Se llama cuando el usuario cambia el Producto */
	onProductoChange() {
		this.tableGeneric?.resetPaginator(); // Resetea paginador del hijo
		this.currentPageIndex = 0; // Resetea paginador local
		this.cargarMovimientos(); // Carga los datos
	}

	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarMovimientos();
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
	onActionClicked(event: { action: string, element: IMovimientoResponse }): void {
		if (event.action === 'delete') {
			this.onDeleteMovimiento(event.element);
		} else {
			console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos (Actualizado)
	/**
	 * Abre diálogo para agregar movimiento.
	 */
	onAddMovimiento(): void {
		const idAlmacen = this.almacenIdSeleccionado();
		const idProducto = this.productoIdSeleccionado();

		// Valida que los selects estén elegidos ANTES de abrir el diálogo
		if (!idAlmacen || !idProducto) {
			this.snackBar.open('Debe seleccionar un almacén y un producto primero.', 'Cerrar', {
				duration: 4000,
				panelClass: ['snackbar-warn'] // Usa clase de advertencia
			});
			return;
		}

		const dialogRef = this.dialog.open(MovimientoForm, {
			width: '600px',
			disableClose: true,
			data: {
				iIdAlmacen: idAlmacen,
				iIdProducto: idProducto
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarMovimientos();
			}
		});
	}

	/**
	 * Abre diálogo de confirmación para anular movimiento.
	 */
	onDeleteMovimiento(movimiento: IMovimientoResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '450px', // Un poco más ancho para el mensaje
			data: {
				titulo: 'Confirmar Anulación',
				mensaje: `¿Estás seguro de ANULAR el movimiento "${movimiento.vTipoMovimientoNombre}" de ${movimiento.dCantidad} unidades? Esta acción revertirá el stock.`,
				mostrarCampoObservacion: true, // A menudo se pide observación para anular
				labelObservacion: 'Motivo de anulación (opcional)'
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				// Llama al servicio de anulación
				this.movimientosService.anularMovimiento(movimiento.iIdMovimiento).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => {
						// El servicio ya mostró el SnackBar de error
						return of(null);
					})
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', {
							duration: 3000,
							panelClass: ['snackbar-success'] // O 'snackbar-warn'
						});
						this.cargarMovimientos(); // Recarga la tabla
					}
				});
			}
		});
	}
	// #endregion
}
