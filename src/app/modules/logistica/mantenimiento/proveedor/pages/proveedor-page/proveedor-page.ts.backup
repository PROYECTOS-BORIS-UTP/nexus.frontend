import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
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
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { IProductoListadoRequest } from '../../interfaces/request/IProductoListadoRequest.interface';
import { IProductoResponse } from '../../interfaces/response/IProductoResponse.interface';
import { ProductoService } from '../../services/producto.service';
import { ProductoForm } from './dialogs/producto-form/producto-form';

@Component({
	selector: 'app-producto-page',
	imports: [
		CommonModule,
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
	templateUrl: './producto-page.html',
	styleUrl: './producto-page.scss'
})
export class ProductoPage {
	// #region Inyección de Dependencias
	private productoService = inject(ProductoService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IProductoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IProductoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vTitulo', 'vFamiliaNombre', 'nStockActual', 'bActivo'];
	selection = new SelectionModel<IProductoResponse>(true, []);
	productoActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Producto', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Producto', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarProductos();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarProductos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IProductoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vTitulo: this.currentFilterValue || undefined,
		};

		this.productoService.listarProductos(request).pipe(
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
		this.cargarProductos();
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
			this.cargarProductos();
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
	onActionClicked(event: { action: string, element: IProductoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditProducto(event.element);
				break;
			case 'delete':
				this.onDeleteProducto(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddProducto(): void {
		const dialogRef = this.dialog.open(ProductoForm, {
			width: '600px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProductos();
			}
		});
	}

	onEditProducto(producto: IProductoResponse): void {
		const dialogRef = this.dialog.open(ProductoForm, {
			width: '600px',
			disableClose: true,
			data: { producto: producto }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProductos();
			}
		});
	}

	onDeleteProducto(producto: IProductoResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el producto "${producto.vTitulo}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.productoService.eliminarProducto({ iIdProducto: producto.iIdProducto }).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
						this.cargarProductos();
					}
				});
			}
		});
	}
	// #endregion
}