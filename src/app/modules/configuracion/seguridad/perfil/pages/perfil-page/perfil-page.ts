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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TableAction, TableGeneric, } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap, } from 'rxjs';
import { IPerfilResponse } from '../../interfaces/response/IPerfilResponse.interface';
import { PerfilService } from '../../services/perfil.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IPerfilListadoRequest } from '../../interfaces/request/IPerfilListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { IPerfilCreateUpdateRequest } from '../../interfaces/request/IPerfilCreateUpdateRequest.interface';
import { PerfilForm } from './dialogs/perfil-form/perfil-form';
import { IPerfilCreateUpdateResponse } from '../../interfaces/response/IPerfilCreateUpdateResponse.interface';
import { IPerfilDeleteResponse } from '../../interfaces/response/IPerfilDeleteResponse.interface';
import { PerfilPermisos } from './dialogs/perfil-permisos/perfil-permisos';

@Component({
	selector: 'app-perfil-page',
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
		EstadoGeneral,
	],
	templateUrl: './perfil-page.html',
	styleUrl: './perfil-page.scss',
})
export class PerfilPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private perfilService = inject(PerfilService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IPerfilResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [5, 10, 15, 25];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IPerfilResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vPerfil', 'vDescripcion', 'bActivo']; // Columnas a mostrar
	selection = new SelectionModel<IPerfilResponse>(true, []);
	perfilActions: TableAction[] = [
		// Cambia nombre a perfilActions
		{ name: 'edit', label: 'Editar Perfil', icon: 'edit' },
		{ name: 'permissions', label: 'Asignar Permisos', icon: 'shield' },
		{ name: 'delete', label: 'Eliminar Perfil', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarPerfiles(); // Carga inicial
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los perfiles del servicio.
	 */
	cargarPerfiles(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IPerfilListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined,
			// Aquí podrías añadir otros filtros si los implementas en la UI
			// bActivo: this.filtroActivo,
		};

		this.perfilService
			.listarPerfiles(request)
			.pipe(
				tap((response) => {
					this.totalRecords.set(response.iTotalRecords);
					this.data.set(response.aRecords);
				}),
				catchError((error) => {
					console.error('Error al cargar perfiles:', error);
					this.snackBar.open(error.message || 'Error al cargar la lista de perfiles.', 'Cerrar', {
						duration: 5000,
						panelClass: ['snackbar-error'],
					});
					this.data.set([]);
					this.totalRecords.set(0);
					return of(null);
				}),
				finalize(() => this.isLoading.set(false))
			)
			.subscribe();
	}
	// #endregion

	// #region Manejo de Paginación
	/*
	 * Maneja los eventos del paginador.
	 */
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarPerfiles();
	}
	// #endregion

	// #region Manejo de Filtro
	/*
	 * Configura la suscripción al filtro.
	 */
	private setupFilterSubscription(): void {
		this.filterSubscription = this.filterSubject
			.pipe(debounceTime(400), distinctUntilChanged())
			.subscribe((filterValue) => {
				this.currentFilterValue = filterValue;
				this.tableGeneric?.resetPaginator();
				this.currentPageIndex = 0;
				this.cargarPerfiles();
			});
	}

	/**
	 * Aplica el filtro desde el input.
	 */
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterSubject.next(filterValue.trim().toLowerCase());
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
	onActionClicked(event: { action: string; element: IPerfilResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditPerfil(event.element);
				break;
			case 'permissions': // <-- NUEVO CASO
				this.onEditPermisos(event.element);
				break;
			case 'delete':
				this.onDeletePerfil(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar perfil.
	 */
	onAddPerfil(): void {
		const dialogRef = this.dialog.open(PerfilForm, {
			width: '100%',
			maxWidth: '700px', // Ajusta según necesidad
			disableClose: true,
			data: {
				perfil: null,
			},
		});

		dialogRef.afterClosed().subscribe((result: IPerfilCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.perfilService.crearActualizarPerfil(result).pipe(
					tap((response: IPerfilCreateUpdateResponse) => {
						this.showSnackbar(response.vMensaje, 'snackbar-success');
						this.cargarPerfiles();
					}),
					catchError((error) => { return of(null); }),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo para editar perfil.
	 */
	onEditPerfil(perfil: IPerfilResponse): void {
		const perfilParaEditar: IPerfilCreateUpdateRequest = {
			iIdPerfil: perfil.iIdPerfil,
			vPerfil: perfil.vPerfil,
			vDescripcion: perfil.vDescripcion,
			bActivo: perfil.bActivo
		};

		const dialogRef = this.dialog.open(PerfilForm, {
			width: '100%',
			maxWidth: '700px',
			disableClose: true,
			data: {
				perfil: perfilParaEditar
			}
		});

		dialogRef.afterClosed().subscribe((result: IPerfilCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);

				console.log(result);
				this.perfilService.crearActualizarPerfil(result).pipe(
					tap((response: IPerfilCreateUpdateResponse) => {
						this.showSnackbar(response.vMensaje, 'snackbar-success');
						this.cargarPerfiles();
					}),
					catchError(error => {
						this.showSnackbar(error.message || 'Error al actualizar la perfil.', 'snackbar-error');
						return of(null);
					}),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo de confirmación para eliminar perfil.
	 */
	onDeletePerfil(perfil: IPerfilResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el perfil "${perfil.vPerfil}"?`,
				mostrarCampoObservacion: false, // O true si tu API lo requiere
			},
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.perfilService
					.eliminarPerfil(perfil.iIdPerfil)
					.pipe(
						tap((response: IPerfilDeleteResponse) => {
							this.showSnackbar(response.vMensaje, 'snackbar-warn');
							this.cargarPerfiles();
						}),
						catchError((error) => {
							this.showSnackbar(error.message || 'Error al eliminar el perfil.', 'snackbar-error');
							return of(null);
						}),
						finalize(() => this.isLoading.set(false))
					).subscribe();
			}
		});
	}

	// --- NUEVO MÉTODO PARA ABRIR EL DIÁLOGO DE PERMISOS ---
	onEditPermisos(perfil: IPerfilResponse): void {
		const dialogRef = this.dialog.open(PerfilPermisos, {
			width: '100%',
			maxWidth: '900px', // Más ancho para el árbol de permisos
			disableClose: true,
			data: {
				iIdPerfil: perfil.iIdPerfil,
				vPerfilNombre: perfil.vPerfil // Pasa el nombre para mostrarlo en el título
			}
		});

		// No se necesita recargar la tabla después de cerrar,
		// ya que los permisos no se muestran en el listado.
		// dialogRef.afterClosed().subscribe(result => { ... });
	}
	// #endregion

	private showSnackbar(message: string, panelClass: string = 'snackbar-info'): void {
		this.snackBar.open(message, 'Cerrar', {
			duration: 5000,
			panelClass: [panelClass],
		});
	}
}
