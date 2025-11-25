import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
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
import { IStockProductoListadoRequest } from '../../interfaces/request/IStockProductoListadoRequest.interface';
import { IStockProductoResponse } from '../../interfaces/response/IStockProductoResponse.interface';
import { StockProductoService } from '../../services/stock-producto.service';
import { StockProductoForm } from './dialogs/stock-producto-form/stock-producto-form';

@Component({
	selector: 'app-stock-producto-page',
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
		MatPaginatorModule
	],
	templateUrl: './stock-producto-page.html',
	styleUrl: './stock-producto-page.scss'
})
export class StockProductoPage {
	// #region Inyección de Dependencias
	private stockProductoService = inject(StockProductoService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IStockProductoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IStockProductoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vAlmacenNombre', 'vProductoCodigo', 'vProductoNombre', 'dStockActual', 'dStockComprometido', 'dStockDisponible', 'dFechaUltimoMovimiento'];
	selection = new SelectionModel<IStockProductoResponse>(true, []);
	stockActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Stock', icon: 'edit' },
		{ name: 'delete', label: 'Reiniciar Stock a 0', icon: 'restart_alt' },
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarStockProductos();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarStockProductos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IStockProductoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
		};

		this.stockProductoService.listarStockProductos(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
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
		this.cargarStockProductos();
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
			this.cargarStockProductos();
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterSubject.next(filterValue.trim());
	}
	// #endregion

	// #region Lógica de Selección
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.data().length;
		return numSelected === numRows && numRows > 0;
	}

	toggleAllRows(): void {
		this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
	}
	// #endregion

	// #region Manejo de Acciones
	onActionClicked(event: { action: string, element: IStockProductoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditStockProducto(event.element);
				break;
			case 'delete':
				this.onDeleteStockProducto(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddStockProducto(): void {
		const dialogRef = this.dialog.open(StockProductoForm, {
			width: '600px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarStockProductos();
			}
		});
	}

	onEditStockProducto(stock: IStockProductoResponse): void {
		const dialogRef = this.dialog.open(StockProductoForm, {
			width: '600px',
			disableClose: true,
			data: { stock: stock }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarStockProductos();
			}
		});
	}

	onDeleteStockProducto(stock: IStockProductoResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Reinicio de Stock',
				mensaje: `¿Estás seguro de reiniciar a CERO el stock de "${stock.vProductoNombre}" en "${stock.vAlmacenNombre}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.stockProductoService.eliminarStockProducto({
					iIdAlmacen: stock.iIdAlmacen,
					iIdProducto: stock.iIdProducto
				}).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarStockProductos();
					}
				});
			}
		});
	}
	// #endregion
}