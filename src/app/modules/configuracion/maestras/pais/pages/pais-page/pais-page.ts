import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TableAction, TableGeneric } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { IPaisResponse } from '../../interfaces/response/IPaisResponse.interface';
import { PaisService } from '../../services/pais.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IPaisListadoRequest } from '../../interfaces/request/IPaisListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';


@Component({
	selector: 'app-pais-page',
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
	templateUrl: './pais-page.html',
	styleUrl: './pais-page.scss'
})
export class PaisPage implements OnInit, OnDestroy {

	// #region Inyección de Dependencias
	private paisService = inject(PaisService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IPaisResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [5, 10, 25, 100]; // Ajusta según necesites
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IPaisResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según IPaisResponse
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vNombre', 'bActivo'];
	selection = new SelectionModel<IPaisResponse>(true, []);
	paisActions: TableAction[] = [ // Acciones específicas
		{ name: 'edit', label: 'Editar País', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar País', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarPaises();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los países del servicio.
	 */
	cargarPaises(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IPaisListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined, // Mapeado desde vNombreFiltro
		};

		this.paisService.listarPaises(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar países:', error);
				this.snackBar.open(error.message || 'Error al cargar la lista de países.', 'Cerrar', {
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
	/*
	 * Maneja los eventos del paginador.
	 */
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarPaises();
	}
	// #endregion

	// #region Manejo de Filtro
	/*
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
			this.cargarPaises();
		});
	}

	/*
	 * Aplica el filtro desde el input.
	 */
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		// Envía el término de búsqueda al Subject
		this.filterSubject.next(filterValue.trim());
	}
	// #endregion

	// #region Lógica de Selección de Filas
	/*
	 * Verifica si todo está seleccionado.
	 */
	isAllSelected(): boolean {
		const numSelected = this.selection.selected.length;
		const numRows = this.data().length;
		return numSelected === numRows && numRows > 0;
	}

	/*
	 * Selecciona/Deselecciona todas las filas.
	 */
	toggleAllRows(): void {
		this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
	}
	// #endregion

	// #region Manejo de Acciones de Fila
	/*
	 * Maneja clics en las acciones de fila.
	 */
	onActionClicked(event: { action: string, element: IPaisResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditPais(event.element);
				break;
			case 'delete':
				this.onDeletePais(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar país.
	 */
	onAddPais(): void {
		// Debes crear el componente PaisForm
		// const dialogRef = this.dialog.open(PaisForm, { width: '500px', disableClose: true, data: {} });
		// dialogRef.afterClosed().subscribe(result => {
		//   if (result) {
		//     console.log('Nuevo país:', result);
		//     // --- LLAMADA AL SERVICIO PARA CREAR ---
		//     // this.paisService.crearActualizarPais(result).subscribe(...);
		//     this.snackBar.open('País creado (simulado).', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
		//     this.cargarPaises();
		//   }
		// });
		alert('Funcionalidad "Agregar País" no implementada.'); // Placeholder
	}

	/*
	 * Abre diálogo para editar país.
	 */
	onEditPais(pais: IPaisResponse): void {
		// const dialogRef = this.dialog.open(PaisForm, { width: '500px', disableClose: true, data: { pais: pais } });
		// dialogRef.afterClosed().subscribe(result => {
		//   if (result) {
		//     console.log('País a actualizar:', result);
		//     // --- LLAMADA AL SERVICIO PARA ACTUALIZAR ---
		//     // this.paisService.crearActualizarPais(result).subscribe(...);
		//     this.snackBar.open(`País "${pais.vNombre}" actualizado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
		//     this.cargarPaises();
		//   }
		// });
		alert(`Funcionalidad "Editar País: ${pais.vNombre}" no implementada.`); // Placeholder
	}

	/*
	 * Abre diálogo de confirmación para eliminar país.
	 */
	onDeletePais(pais: IPaisResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el país "${pais.vNombre}"?`,
				mostrarCampoObservacion: false // O true si tu API lo requiere
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				console.log('Eliminando país:', pais.iIdPais, 'Observación:', result.observacion);
				// --- LLAMADA AL SERVICIO PARA ELIMINAR ---
				// this.paisService.eliminarPais(pais.iIdPais, result.observacion).subscribe(...);
				this.snackBar.open(`País "${pais.vNombre}" eliminado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
				this.cargarPaises();
			}
		});
	}
	// #endregion
}