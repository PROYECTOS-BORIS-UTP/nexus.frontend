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
import { IUbigeoResponse } from '../../interfaces/response/IUbigeoResponse.interface';
import { UbigeoService } from '../../services/ubigeo.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IUbigeoListadoRequest } from '../../interfaces/request/IUbigeoListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { UbigeoForm } from '../dialogs/ubigeo-form/ubigeo-form';
import { IUbigeoCreateUpdateRequest } from '../../interfaces/request/IUbigeoCreateUpdateRequest.interface';

@Component({
	selector: 'app-ubigeo-page',
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
	templateUrl: './ubigeo-page.html',
	styleUrl: './ubigeo-page.scss'
})
export class UbigeoPage implements OnInit, OnDestroy {

	// #region Inyección de Dependencias
	private ubigeoService = inject(UbigeoService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IUbigeoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50, 100]; // Ajusta según necesites
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IUbigeoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según IUbigeoResponse
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vDescripcion', 'vTipoUbigeoDescripcion', 'vPaisNombre', 'bActivo'];
	selection = new SelectionModel<IUbigeoResponse>(true, []);
	ubigeoActions: TableAction[] = [ // Acciones específicas
		{ name: 'edit', label: 'Editar Ubigeo', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Ubigeo', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarUbigeos();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los ubigeos del servicio.
	 */
	cargarUbigeos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IUbigeoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined, // Mapeado desde vDescripcionFiltro
			// Puedes añadir otros filtros aquí si es necesario
		};

		this.ubigeoService.listarUbigeos(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar ubigeos:', error);
				this.snackBar.open(error.message || 'Error al cargar la lista de ubigeos.', 'Cerrar', {
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
		this.cargarUbigeos();
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
			this.cargarUbigeos();
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
	onActionClicked(event: { action: string, element: IUbigeoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditUbigeo(event.element);
				break;
			case 'delete':
				this.onDeleteUbigeo(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar ubigeo.
	 */
	onAddUbigeo(): void {
		const dialogRef = this.dialog.open(UbigeoForm, {
			width: '100%',
			maxWidth: '700px', // Ajusta según necesidad
			disableClose: true,
			data: {
				UbigeoExistente: null,
			}
		});

		dialogRef.afterClosed().subscribe((result:IUbigeoCreateUpdateRequest| undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.ubigeoService.crearActualizarUbigeo(result).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || 'Ubigeo Creado exitosamente.', 'snackbar-success');
						this.cargarUbigeos();
					}),
					catchError(error => { return of(null); }),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo para editar ubigeo.
	 */
	onEditUbigeo(ubigeo: IUbigeoResponse): void {
        // Se construye un objeto con todos los datos necesarios para editar, incluyendo
        // los IDs para el formulario reactivo y las descripciones si el formulario las usa.
		const ubigeoParaEditar: any = { 
			iIdUbigeo: ubigeo.iIdUbigeo,
			vCodigo: ubigeo.vCodigo,
			vDescripcion: ubigeo.vDescripcion,
			iIdTipoUbigeo: ubigeo.iIdTipoUbigeo,
            // Datos adicionales útiles para el formulario de edición
            vTipoUbigeoDescripcion: ubigeo.vTipoUbigeoDescripcion, 
			iIdPais: ubigeo.iIdPais,
            vPaisNombre: ubigeo.vPaisNombre, 
			bActivo: ubigeo.bActivo,
		};

		const dialogRef = this.dialog.open(UbigeoForm, {
			width: '100%',
			maxWidth: '700px',
			disableClose: true,
			data: {
				UbigeoExistente: ubigeoParaEditar,
			}
		});

		dialogRef.afterClosed().subscribe((result: IUbigeoCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.ubigeoService.crearActualizarUbigeo(result).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || `Elemento "${ubigeo.vDescripcion}" actualizado.`, 'snackbar-success');
						this.cargarUbigeos();
					}),
					catchError(error => {
						this.showSnackbar(error.message || 'Error al actualizar el elemento.', 'snackbar-error');
						return of(null);
					}),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo de confirmación para eliminar ubigeo.
	 */
	onDeleteUbigeo(ubigeo: IUbigeoResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el ubigeo "${ubigeo.vDescripcion}"?`,
				mostrarCampoObservacion: false // O true si tu API lo requiere
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.ubigeoService.eliminarUbigeo(ubigeo.iIdUbigeo).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || `Elemento "${ubigeo.vDescripcion}" desactivado.`, 'snackbar-warn');
						this.cargarUbigeos();
					}),
					catchError(error => {
						this.showSnackbar(error.message || 'Error al eliminar el elemento.', 'snackbar-error');
						return of(null);
					}),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}
	// #endregion
	private showSnackbar(message: string, panelClass: string = 'snackbar-info'): void {
		this.snackBar.open(message, 'Cerrar', {
			duration: 5000,
			panelClass: [panelClass]
		});
	}
}