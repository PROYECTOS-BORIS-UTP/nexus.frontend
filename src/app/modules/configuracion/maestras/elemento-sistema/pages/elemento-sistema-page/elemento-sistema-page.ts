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

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IElementoSistemaResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según IElementoSistemaResponse
	aDisplayedColumns: string[] = ['select', 'vCodigo', 'vAbreviatura', 'vDescripcion', 'iIdTipoElemento', 'iIdCompania', 'bActivo']; // Ajusta las columnas
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
	 * Obtiene los elementos del sistema del servicio.
	 */
	cargarElementosSistema(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IElementoSistemaListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			// Usaremos sTerminoBusqueda para filtrar por Código o Descripción
			sTerminoBusqueda: this.currentFilterValue || undefined,
			// Puedes añadir otros filtros aquí si es necesario
			// iIdTipoElemento: ...,
			// iIdCompania: ...,
			// bActivo: ...,
		};

		this.elementoSistemaService.listarElementosSistema(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar elementos del sistema:', error);
				this.snackBar.open(error.message || 'Error al cargar la lista de elementos.', 'Cerrar', {
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
		const dialogRef = this.dialog.open(ElementoSistemaForm, {
			width: '100%',
			maxWidth: '700px', // Ajusta según necesidad
			disableClose: true,
			data: { elemento: null } // Indica creación
		});

		dialogRef.afterClosed().subscribe((result: IElementoSistemaCreateUpdateRequest | undefined) => {
			if (result) {
				this.isLoading.set(true);
				this.elementoSistemaService.crearActualizarElementoSistema(result).pipe(
					tap(response => {
						this.showSnackbar(response.vMensaje || 'Elemento creado exitosamente.', 'snackbar-success');
						this.cargarElementosSistema();
					}),
					catchError(error => {
						this.showSnackbar(error.message || 'Error al crear el elemento.', 'snackbar-error');
						return of(null);
					}),
					finalize(() => this.isLoading.set(false))
				).subscribe();
			}
		});
	}

	/*
	 * Abre diálogo para editar elemento.
	 */
	onEditElementoSistema(elemento: IElementoSistemaResponse): void {
		// ¡¡IMPORTANTE!! Verifica que 'elemento' (IElementoSistemaResponse) tenga TODOS los campos
		// necesarios para 'IElementoSistemaCreateUpdateRequest'. Si faltan, debes añadirlos
		// a IElementoSistemaResponse y a la respuesta del backend (SP de listado).
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
			data: { elemento: elementoParaEditar } // Pasa los datos mapeados
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