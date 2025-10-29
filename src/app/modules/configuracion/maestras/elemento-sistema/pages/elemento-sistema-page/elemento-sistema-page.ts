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
import { IElementoSistemaResponse } from '../../interfaces/response/IElementoSistemaResponse.interface';
import { ElementoSistemaService } from '../../services/elemento-sistema.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IElementoSistemaListadoRequest } from '../../interfaces/request/IElementoSistemaListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { IElementoSistemaCreateUpdateRequest } from '../../interfaces/request/IElementoSistemaCreateUpdateRequest.interface';
import { ElementoSistemaForm } from './dialogs/elemento-sistema-form/elemento-sistema-form';

@Component({
	selector: 'app-elemento-sistema-page',
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
		EstadoGeneral // Componente para estado
	],
	templateUrl: './elemento-sistema-page.html',
	styleUrl: './elemento-sistema-page.scss'
})
export class ElementoSistemaPage implements OnInit, OnDestroy {

	// #region Inyección de Dependencias
	private elementoSistemaService = inject(ElementoSistemaService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IElementoSistemaResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50, 100]; // Ajusta según necesites
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	currentParentElement = signal<IElementoSistemaResponse | null>(null); // Padre actual
	breadcrumb = signal<IElementoSistemaResponse[]>([]);

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IElementoSistemaResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según IElementoSistemaResponse
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vAbreviatura', 'vDescripcion', 'bActivo','viewChildren']; // Ajusta las columnas
	selection = new SelectionModel<IElementoSistemaResponse>(true, []);
	elementoSistemaActions: TableAction[] = [ // Acciones específicas
		{ name: 'edit', label: 'Editar Elemento', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Elemento', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarElementosSistema();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los elementos del sistema del servicio, filtrando por padre si se especifica.
	 * @param parentId ID del elemento padre (o null para el nivel raíz).
	 */
	cargarElementosSistema(parentId: number | null = this.currentParentElement()?.iIdElemento ?? null): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IElementoSistemaListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			// sTerminoBusqueda: this.currentFilterValue || undefined,
			iIdElementoPadre: parentId,
		};

		this.elementoSistemaService.listarElementosSistema(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				this.showSnackbar(error.message || 'Error al cargar elementos del sistema.', 'snackbar-error');
				this.data.set([]);
				this.totalRecords.set(0);
				return of(null);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe();
	}
	// #endregion

	// #region Navegación Jerárquica
	/*
	 * Carga los hijos del elemento seleccionado.
	 * @param elemento El elemento padre cuyos hijos se mostrarán.
	 */
	viewChildren(elemento: IElementoSistemaResponse): void {
		// Actualiza breadcrumb y padre actual
		this.breadcrumb.update(b => [...b, elemento]);
		this.currentParentElement.set(elemento);
		// Resetea filtro y paginación
		this.currentFilterValue = '';
		// Resetea visualmente el input de filtro si tienes una referencia a él
		// if (this.inputFilter) this.inputFilter.nativeElement.value = '';
		this.resetPaginationAndLoad();
	}

	/*
	* Navega al nivel superior en la jerarquía.
	*/
	goBack(): void {
		if (this.breadcrumb().length > 0) {
			// Quita el último elemento del breadcrumb
			const newBreadcrumb = this.breadcrumb().slice(0, -1);
			this.breadcrumb.set(newBreadcrumb);
			// Establece el nuevo padre actual (o null si se vació el breadcrumb)
			this.currentParentElement.set(newBreadcrumb.length > 0 ? newBreadcrumb[newBreadcrumb.length - 1] : null);
			// Resetea filtro y paginación
			this.currentFilterValue = '';
			// if (this.inputFilter) this.inputFilter.nativeElement.value = '';
			this.resetPaginationAndLoad();
		}
	}

	/*
	* Navega a un nivel específico del breadcrumb.
	* @param index Índice del elemento en el breadcrumb al que navegar.
	*/
	goToBreadcrumbLevel(index: number): void {
		const newBreadcrumb = this.breadcrumb().slice(0, index + 1);
		this.breadcrumb.set(newBreadcrumb);
		this.currentParentElement.set(newBreadcrumb[newBreadcrumb.length - 1]); // El padre es el último del nuevo breadcrumb
		this.currentFilterValue = '';
		// if (this.inputFilter) this.inputFilter.nativeElement.value = '';
		this.resetPaginationAndLoad();
	}

	/*
	 * Navega al nivel raíz (sin padre).
	 */
	goToRoot(): void {
		this.breadcrumb.set([]);
		this.currentParentElement.set(null);
		this.currentFilterValue = '';
		// if (this.inputFilter) this.inputFilter.nativeElement.value = '';
		this.resetPaginationAndLoad();
	}
	// #endregion

	// #region Manejo de Paginación
	/*
	 * Maneja los eventos del paginador.
	 */
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarElementosSistema();
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
			this.cargarElementosSistema();
		});
	}

	/*
	 * Aplica el filtro desde el input.
	 */
	applyFilter(filterValue: string): void {
		this.filterSubject.next(filterValue.trim());
	}
	// #endregion

	/** Resetea la paginación a la primera página y recarga los datos */
	private resetPaginationAndLoad(): void {
		this.tableGeneric?.resetPaginator(); // Resetea el paginador visual
		this.currentPageIndex = 0; // Resetea el índice lógico
		this.cargarElementosSistema(); // Carga los datos del nivel actual (con el filtro si existe)
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

	checkboxLabel(row?: IElementoSistemaResponse): string {
		if (!row) {
			return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
		}
		return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.iIdElemento + 1}`;
	}
	// #endregion

	// #region Manejo de Acciones de Fila
	/*
	 * Maneja clics en las acciones de fila.
	 */
	onActionClicked(event: { action: string, element: IElementoSistemaResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditElementoSistema(event.element);
				break;
			case 'delete':
				this.onDeleteElementoSistema(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar elemento.
	 */
	onAddElementoSistema(): void {
		console.log(this.currentParentElement()?.iIdElemento);
		const dialogRef = this.dialog.open(ElementoSistemaForm, {
			width: '100%',
			maxWidth: '700px', // Ajusta según necesidad
			disableClose: true,
			data: {
				elemento: null,
				idPadre: this.currentParentElement()?.iIdElemento ?? null
			}
		});

		dialogRef.afterClosed().subscribe((result: IElementoSistemaCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.elementoSistemaService.crearActualizarElementoSistema(result).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || 'Elemento creado exitosamente.', 'snackbar-success');
						this.cargarElementosSistema();
					}),
					catchError(error => { /* ... sin cambios ... */ return of(null); }),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo para editar elemento.
	 */
	onEditElementoSistema(elemento: IElementoSistemaResponse): void {
		const elementoParaEditar: IElementoSistemaCreateUpdateRequest = {
			iIdElemento: elemento.iIdElemento,
			iIdElementoPadre: elemento.iIdElementoPadre,
			vCodigo: elemento.vCodigo,
			vAbreviatura: elemento.vAbreviatura,
			vDescripcion: elemento.vDescripcion,
			iSubGrupo: elemento.iSubGrupo,
			bActivo: elemento.bActivo,
			iIdTipoElemento: elemento.iIdTipoElemento,
			iIdCompania: elemento.iIdCompania,
			iIdPais: elemento.iIdPais,
		};

		const dialogRef = this.dialog.open(ElementoSistemaForm, {
			width: '100%',
			maxWidth: '700px',
			disableClose: true,
			data: {
				elemento: elementoParaEditar,
				idPadre: elementoParaEditar.iIdElementoPadre
			}
		});

		dialogRef.afterClosed().subscribe((result: IElementoSistemaCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.elementoSistemaService.crearActualizarElementoSistema(result).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || `Elemento "${elemento.vDescripcion}" actualizado.`, 'snackbar-success');
						this.cargarElementosSistema();
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
	 * Abre diálogo de confirmación para eliminar elemento.
	 */
	onDeleteElementoSistema(elemento: IElementoSistemaResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el elemento "${elemento.vDescripcion}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.elementoSistemaService.eliminarElementoSistema(elemento.iIdElemento).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || `Elemento "${elemento.vDescripcion}" eliminado.`, 'snackbar-warn');
						this.cargarElementosSistema();
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