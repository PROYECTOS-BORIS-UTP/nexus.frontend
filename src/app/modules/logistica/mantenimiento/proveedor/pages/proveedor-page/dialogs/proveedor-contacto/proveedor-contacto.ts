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
import { Confirmacion } from '../../../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { EstadoGeneral } from '../../../../../../../../common/components/estado-general/estado-general/estado-general';
import { TableGeneric, TableAction } from '../../../../../../../../common/components/table-generic/table-generic';
import { IProveedorResponse } from '../../../../interfaces/response/IProveedorResponse.interface';
import { IProveedorContactoListadoRequest } from './interfaces/request/IProveedorContactoListadoRequest.interface';
import { IProveedorContactoResponse } from './interfaces/response/IProveedorContactoResponse.interface';
import { ProveedorContactoService } from './services/proveedor-contacto.service';
import { ProveedorContactoFormComponent } from './dialogs/proveedor-contacto-form/proveedor-contacto-form';

export interface ProveedorContactoDialogData {
	proveedor: IProveedorResponse;
}

@Component({
	selector: 'app-proveedor-contacto',
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
	templateUrl: './proveedor-contacto.html',
	styleUrl: './proveedor-contacto.scss'
})
export class ProveedorContacto implements OnInit, OnDestroy {
	// #region Inyección de Dependencias
	private contactoService = inject(ProveedorContactoService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<ProveedorContacto>);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IProveedorContactoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	proveedor: IProveedorResponse;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IProveedorContactoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNombreCompleto', 'vCargo', 'vCelular', 'vCorreo', 'bActivo'];
	selection = new SelectionModel<IProveedorContactoResponse>(true, []);
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

	constructor(@Inject(MAT_DIALOG_DATA) public dialogData: ProveedorContactoDialogData) {
		this.proveedor = dialogData.proveedor;
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

		const request: IProveedorContactoListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			iIdProveedor: this.proveedor.iIdProveedor,
			vNombreCompleto: this.currentFilterValue || undefined,
		};

		this.contactoService.listarContactos(request).pipe(
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
	onActionClicked(event: { action: string, element: IProveedorContactoResponse }): void {
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
		const dialogRef = this.dialog.open(ProveedorContactoFormComponent, {
			width: '100%',
			maxWidth: '600px',
			disableClose: true,
			data: {
				idProveedor: this.proveedor.iIdProveedor
			},
			panelClass: 'dialogo-contacto-custom'
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarContactos();
			}
		});
	}

	onEditContacto(contacto: IProveedorContactoResponse): void {
		const dialogRef = this.dialog.open(ProveedorContactoFormComponent, {
			width: '100%',
			maxWidth: '600px',
			disableClose: true,
			data: {
				idProveedor: this.proveedor.iIdProveedor,
				contacto: contacto
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarContactos();
			}
		});
	}

	onDeleteContacto(contacto: IProveedorContactoResponse): void {
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
				this.contactoService.eliminarContacto({ iIdContacto: contacto.iIdContacto }).pipe(
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