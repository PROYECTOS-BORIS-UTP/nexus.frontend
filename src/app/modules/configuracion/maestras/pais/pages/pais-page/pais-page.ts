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
import { PaisForm } from './dialogs/pais-form/pais-form';
import { IPaisCreateUpdateRequest } from '../../interfaces/request/IPaisCreateUpdateRequest.interface';
import { IPaisCreateUpdateResponse } from '../../interfaces/response/IPaisCreateUpdateResponse.interface';
import { IPaisDeleteResponse } from '../../interfaces/response/IPaisDeleteResponse.interface';


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
		 const dialogRef = this.dialog.open(PaisForm, {
					width: '100%',
					maxWidth: '700px', // Ajusta según necesidad
					disableClose: true,
					data: {
						pais: null
					}
				});
		
				dialogRef.afterClosed().subscribe((result: IPaisCreateUpdateRequest | undefined) => {
					if (result) {
						this.isLoading.set(true);
						this.paisService.crearActualizarCompania(result).pipe(
							tap((response: IPaisCreateUpdateResponse) => {
								this.showSnackbar(response.vMensaje, 'snackbar-success');
								this.cargarPaises();
							}),
							catchError(error => { return of(null); }),
							finalize(() => this.isLoading.set(false))
						).subscribe();
					}
				});
	}

	/*
	 * Abre diálogo para editar país.
	 */
	onEditPais(pais: IPaisResponse): void {
		const paisParaEditar: IPaisCreateUpdateRequest = {
					iIdPais: pais.iIdPais
					, vCodigo: pais.vCodigo
					, vNombre: pais.vNombre
					, bActivo: pais.bActivo
				};
		
		
		
				const dialogRef = this.dialog.open(PaisForm, {
					width: '100%',
					maxWidth: '700px',
					disableClose: true,
					data: {
						pais: paisParaEditar
					}
				});
		
				dialogRef.afterClosed().subscribe((result: IPaisCreateUpdateRequest | undefined) => {
					if (result) {
						this.isLoading.set(true);
						this.paisService.crearActualizarCompania(result).pipe(
							tap((response: IPaisCreateUpdateResponse) => {
								this.showSnackbar(response.vMensaje, 'snackbar-success');
								this.cargarPaises();
							}),
							catchError(error => {
								this.showSnackbar(error.message || 'Error al actualizar la pais.', 'snackbar-error');
								return of(null);
							}),
							finalize(() => this.isLoading.set(false))
						).subscribe();
					}
				});
	}

	/*
	 * Abre diálogo de confirmación para eliminar país.
	 */
	onDeletePais(pais: IPaisResponse): void {
		 const dialogRef = this.dialog.open(Confirmacion, {
					width: '400px',
					data: {
						titulo: 'Confirmar Eliminación',
						mensaje: `¿Estás seguro de eliminar la pais "${pais.vNombre}"?`,
						mostrarCampoObservacion: false // O true si tu API lo requiere
					}
				});
		
				dialogRef.afterClosed().subscribe(result => {
					if (result && result.confirmado) {
						this.isLoading.set(true);
						this.paisService.eliminarPais(pais.iIdPais).pipe(
							tap((response: IPaisDeleteResponse) => {
								this.showSnackbar(response.vMensaje, 'snackbar-warn');
								this.cargarPaises();
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