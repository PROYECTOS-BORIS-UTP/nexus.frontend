import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription, tap, catchError, of, finalize, debounceTime, distinctUntilChanged } from 'rxjs';
import { IClienteResponse } from '../../../cliente/interfaces/response/IClienteResponse.interface';
import { IClienteContactoListadoRequest } from '../../interfaces/request/IClienteContactoListadoRequest.interface';
import { IClienteContactoResponse } from '../../interfaces/response/IClienteContactoResponse.interface';
import { ClienteContactoService } from '../../services/cliente-contacto.service';
import { ClienteContactoForm } from './dialogs/cliente-contacto-form/cliente-contacto-form';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';

export interface ClienteContactoDialogData {
	cliente: IClienteResponse;
}

@Component({
	selector: 'app-cliente-contacto-page',
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
	templateUrl: './cliente-contacto-page.html',
	styleUrl: './cliente-contacto-page.scss'
})
export class ClienteContactoPage implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private contactoService = inject(ClienteContactoService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<ClienteContactoPage>);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IClienteContactoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	cliente: IClienteResponse;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IClienteContactoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNombreCompleto', 'vCargo', 'vCelular', 'vCorreo', 'bEsPrincipal', 'bActivo'];
	selection = new SelectionModel<IClienteContactoResponse>(true, []);
	contactoActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Contacto', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Contacto', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	constructor(@Inject(MAT_DIALOG_DATA) public dialogData: ClienteContactoDialogData) {
		this.cliente = dialogData.cliente;
	}

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarContactos();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarContactos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IClienteContactoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			iIdCliente: this.cliente.iIdCliente,
			vNombreCompleto: this.currentFilterValue || undefined,
		};

		this.contactoService.ListadoClienteContacto(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords || 0);
				this.data.set(response.aRecords || []);
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
		this.cargarContactos();
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
			this.cargarContactos();
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
	onActionClicked(event: { action: string, element: IClienteContactoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditContacto(event.element);
				break;
			case 'delete':
				this.onDeleteContacto(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddContacto(): void {
		const dialogRef = this.dialog.open(ClienteContactoForm, {
			width: '100%',
			maxWidth: '600px',
			disableClose: true,
			data: {
				iIdCliente: this.cliente.iIdCliente
			},
			panelClass: 'dialogo-contacto-custom'
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarContactos();
			}
		});
	}

	onEditContacto(contacto: IClienteContactoResponse): void {
		const dialogRef = this.dialog.open(ClienteContactoForm, {
			width: '100%',
			maxWidth: '600px',
			disableClose: true,
			data: {
				iIdCliente: this.cliente.iIdCliente,
				contacto: contacto
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarContactos();
			}
		});
	}

	onDeleteContacto(contacto: IClienteContactoResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el contacto "${contacto.vNombreCompleto}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.contactoService.EliminarClienteContacto({ iIdClienteContacto: contacto.iIdClienteContacto }).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarContactos();
					}
				});
			}
		});
	}

	onClose(): void {
		this.dialogRef.close();
	}
	// #endregion
}
