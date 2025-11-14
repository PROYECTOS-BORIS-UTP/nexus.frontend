import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, Subscription, tap, catchError, of, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { IAlmacenListadoRequest } from '../../interfaces/request/IAlmacenListadoRequest.interface';
import { IAlmacenResponse } from '../../interfaces/response/IAlmacenResponse.interface';
import { AlmacenService } from '../../services/almacen.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { AlmacenForm } from './dialogs/almacen-form/almacen-form';
import { IAlmacenDeleteResponse } from '../../interfaces/response/IAlmacenDeleteResponse.interface';

@Component({
	selector: 'app-almacen-page',
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
		MatPaginatorModule, // Necesario para TableGeneric
		EstadoGeneral // Componente para estado
	],
	templateUrl: './almacen-page.html',
	styleUrl: './almacen-page.scss'
})
export class AlmacenPage {
	// #region Inyección de Dependencias
	private almacenService = inject(AlmacenService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IAlmacenResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50, 100]; // Ajusta según necesites
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IAlmacenResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según IAlmacenResponse
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vNombre', 'vDireccion', 'vUbigeoNombre', 'iIdCompania', 'bActivo'];
	selection = new SelectionModel<IAlmacenResponse>(true, []);
	almacenActions: TableAction[] = [ // Acciones específicas
		{ name: 'edit', label: 'Editar Almacén', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Almacén', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarAlmacenes();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los almacenes del servicio.
	 */
	cargarAlmacenes(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IAlmacenListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vNombre: this.currentFilterValue || undefined,
		};

		this.almacenService.listarAlmacenes(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar almacenes:', error);
				this.snackBar.open(error.message || 'Error al cargar la lista de almacenes.', 'Cerrar', {
					duration: 5000, panelClass: ['snackbar-error']
				});
				this.data.set([]);
				this.totalRecords.set(0);
				return of(null);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe();
	}
	// #endregion

	// #region Manejo de Paginación
	/**
	 * Maneja los eventos del paginador.
	 */
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarAlmacenes();
	}
	// #endregion

	// #region Manejo de Filtro
	/**
	 * Configura la suscripción al filtro.
	 */
	private setupFilterSubscription(): void {
		this.filterSubscription = this.filterSubject.pipe(
			debounceTime(400),
			distinctUntilChanged()
		).subscribe(filterValue => {
			this.currentFilterValue = filterValue;
			this.tableGeneric?.resetPaginator();
			this.currentPageIndex = 0;
			this.cargarAlmacenes();
		});
	}

	/**
	 * Aplica el filtro desde el input.
	 */
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		// Envía el término de búsqueda al Subject
		this.filterSubject.next(filterValue.trim());
	}
	// #endregion

	// #region Lógica de Selección de Filas
	/**
	 * Verifica si todo está seleccionado.
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.data().length;
		return numSelected === numRows && numRows > 0;
	}

	/**
	 * Selecciona/Deselecciona todas las filas.
	 */
	toggleAllRows(): void {
		this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
	}
	// #endregion

	// #region Manejo de Acciones de Fila
	/**
	 * Maneja clics en las acciones de fila.
	 */
	onActionClicked(event: { action: string, element: IAlmacenResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditAlmacen(event.element);
				break;
			case 'delete':
				this.onDeleteAlmacen(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/**
	 * Abre diálogo para agregar almacén.
	 */
	onAddAlmacen(): void {
		const dialogRef = this.dialog.open(AlmacenForm, {
			width: '600px', // Ajusta el ancho según tu formulario
			disableClose: true,
			data: {} // Sin datos para nuevo almacén
		});

		dialogRef.afterClosed().subscribe(result => {
			// Si result es 'true' (o cualquier valor exitoso que devuelvas)
			if (result) {
				this.cargarAlmacenes(); // Recarga la tabla
			}
		});
	}

	/**
	 * Abre diálogo para editar almacén.
	 */
	onEditAlmacen(almacen: IAlmacenResponse): void {
		const dialogRef = this.dialog.open(AlmacenForm, {
			width: '600px', // Ajusta el ancho
			disableClose: true,
			data: { almacen: almacen } // Pasa el almacén existente
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarAlmacenes(); // Recarga la tabla
			}
		});
	}

	/*
	 * Abre diálogo de confirmación para eliminar almacén.
	 */
	onDeleteAlmacen(almacen: IAlmacenResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el almacén "${almacen.vNombre}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.almacenService.eliminarAlmacen(almacen.iIdAlmacen).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: IAlmacenDeleteResponse) => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarAlmacenes();
					}
				});
			}
		});
	}
	// #endregion
}
