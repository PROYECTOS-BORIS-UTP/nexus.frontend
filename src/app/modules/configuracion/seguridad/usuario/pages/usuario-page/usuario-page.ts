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
import { UsuarioForm } from './dialogs/usuario-form/usuario-form';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap, } from 'rxjs';
import { IUsuarioResponse } from '../../interfaces/response/IUsuarioResponse.interface';
import { UsuarioService } from '../../services/usuario.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IUsuarioListadoRequest } from '../../interfaces/request/IUsuarioListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { IUsuarioCreateUpdateRequest } from '../../interfaces/request/IUsuarioCreateUpdateRequest.interface';

@Component({
	selector: 'app-usuario-page',
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
	templateUrl: './usuario-page.html',
	styleUrl: './usuario-page.scss',
})
export class UsuarioPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private usuarioService = inject(UsuarioService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IUsuarioResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [5, 10, 15, 25];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IUsuarioResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vUsuario', 'iIdTipoUsuario', 'iIdPersona', 'iIdTipoPersona', 'bActivo'];
	selection = new SelectionModel<IUsuarioResponse>(true, []);
	usuarioActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Usuario', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Usuario', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarUsuarios();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/**
	 * Obtiene los usuarios del servicio.
	 */
	cargarUsuarios(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IUsuarioListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined,
			// Aquí puedes agregar otros filtros si se implementan inputs específicos
			// iIdTipoUsuario: ...,
			// bActivo: ...
		};

		this.usuarioService.listarUsuarios(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar usuarios:', error);
				this.snackBar.open(error.message || 'Error al cargar la lista de usuarios.', 'Cerrar', {
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
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarUsuarios();
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
			this.cargarUsuarios();
		});
	}

	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterSubject.next(filterValue.trim());
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
	onActionClicked(event: { action: string, element: IUsuarioResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditUsuario(event.element);
				break;
			case 'delete':
				this.onDeleteUsuario(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddUsuario(): void {
		const dialogRef = this.dialog.open(UsuarioForm, {
			width: '600px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarUsuarios();
			}
		});
	}

	onEditUsuario(usuario: IUsuarioResponse): void {
		const dialogRef = this.dialog.open(UsuarioForm, {
			width: '600px',
			disableClose: true,
			data: { usuario: usuario }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarUsuarios();
			}
		});
	}

	onDeleteUsuario(usuario: IUsuarioResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar al usuario "${usuario.vUsuario}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.usuarioService.eliminarUsuario(usuario.iIdUsuario).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null)) // Servicio maneja snackbar
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarUsuarios();
					}
				});
			}
		});
	}
	// #endregion
}