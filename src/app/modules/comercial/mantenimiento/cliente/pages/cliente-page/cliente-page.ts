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
import { IClienteListadoRequest } from '../../interfaces/request/IClienteListadoRequest.interface';
import { IClienteResponse } from '../../interfaces/response/IClienteResponse.interface';
import { ClienteService } from '../../services/cliente.service';
import { ClienteForm } from './dialogs/cliente-form/cliente-form';
import { ClienteContactoPage } from '../../../cliente-contacto/pages/cliente-contacto-page/cliente-contacto-page';

@Component({
	selector: 'app-cliente-page',
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
	templateUrl: './cliente-page.html',
	styleUrl: './cliente-page.scss'
})
export class ClientePage {
	// #region Inyección de Dependencias
	private clienteService = inject(ClienteService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IClienteResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IClienteResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumeroDocumento', 'vRazonSocial', 'vDireccionFiscal', 'vTelefono', 'bActivo'];
	selection = new SelectionModel<IClienteResponse>(true, []);
	clienteActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Cliente', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Cliente', icon: 'delete' },
		{ name: 'contactos', label: 'Contactos', icon: 'perm_contact_calendar' }
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarClientes();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarClientes(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IClienteListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vRazonSocial: this.currentFilterValue || undefined,
			// If the filter is a number, checking it for vNumeroDocumento could be an option, but keeping it simple for now as per logic
		};

		this.clienteService.ListadoCliente(request).pipe(
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
		this.cargarClientes();
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
			this.cargarClientes();
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
	onActionClicked(event: { action: string, element: IClienteResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditCliente(event.element);
				break;
			case 'delete':
				this.onDeleteCliente(event.element);
				break;
			case 'contactos':
				this.onContactosCliente(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddCliente(): void {
		const dialogRef = this.dialog.open(ClienteForm, {
			width: '600px',
			maxWidth: '800px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarClientes();
			}
		});
	}

	onEditCliente(cliente: IClienteResponse): void {
		const dialogRef = this.dialog.open(ClienteForm, {
			width: '600px',
			maxWidth: '800px',
			disableClose: true,
			data: { cliente: cliente }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarClientes();
			}
		});
	}

	onDeleteCliente(cliente: IClienteResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el cliente "${cliente.vRazonSocial}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.clienteService.EliminarCliente({ iIdCliente: cliente.iIdCliente }).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
						this.cargarClientes();
					}
				});
			}
		});
	}

	onContactosCliente(cliente: IClienteResponse): void {
		this.dialog.open(ClienteContactoPage, {
			width: '90%',
			maxWidth: '900px',
			data: {
				cliente: cliente
			},
			panelClass: 'dialogo-contacto-page'
		});
	}
	// #endregion
}
