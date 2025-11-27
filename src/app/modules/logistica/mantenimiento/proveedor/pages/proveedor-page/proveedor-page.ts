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
import { IProveedorListadoRequest } from '../../interfaces/request/IProveedorListadoRequest.interface';
import { IProveedorResponse } from '../../interfaces/response/IProveedorResponse.interface';
import { ProveedorService } from '../../services/proveedor.service';
import { ProveedorForm } from './dialogs/proveedor-form/proveedor-form';
import { ProveedorContacto } from './dialogs/proveedor-contacto/proveedor-contacto';

@Component({
	selector: 'app-proveedor-page',
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
	templateUrl: './proveedor-page.html',
	styleUrl: './proveedor-page.scss'
})
export class ProveedorPage {
	// #region Inyección de Dependencias
	private proveedorService = inject(ProveedorService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IProveedorResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IProveedorResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vRUC', 'vRazonSocial', 'vDireccion', 'bActivo'];
	selection = new SelectionModel<IProveedorResponse>(true, []);
	proveedorActions: TableAction[] = [
		{ name: 'contactos', label: 'Contactos', icon: 'contacts' },
		{ name: 'edit', label: 'Editar Proveedor', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Proveedor', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarProveedores();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarProveedores(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IProveedorListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vRazonSocial: this.currentFilterValue || undefined,
		};

		this.proveedorService.listarProveedores(request).pipe(
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
		this.cargarProveedores();
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
			this.cargarProveedores();
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
	onActionClicked(event: { action: string, element: IProveedorResponse }): void {
		switch (event.action) {
			case 'contactos':
				this.onContactosProveedor(event.element);
				break;
			case 'edit':
				this.onEditProveedor(event.element);
				break;
			case 'delete':
				this.onDeleteProveedor(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddProveedor(): void {
		const dialogRef = this.dialog.open(ProveedorForm, {
			width: '600px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProveedores();
			}
		});
	}

	onContactosProveedor(proveedor: IProveedorResponse): void {
		const dialogRef = this.dialog.open(ProveedorContacto, {
			width: '100%',
			maxWidth: '800px',
			disableClose: false,
			data: { proveedor: proveedor }
		});
	}

	onEditProveedor(proveedor: IProveedorResponse): void {
		const dialogRef = this.dialog.open(ProveedorForm, {
			width: '100%',
			maxWidth: '800px',
			disableClose: true,
			data: { proveedor: proveedor }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarProveedores();
			}
		});
	}

	onDeleteProveedor(proveedor: IProveedorResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el proveedor "${proveedor.vRazonSocial}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.proveedorService.eliminarProveedor({ iIdProveedor: proveedor.iIdProveedor }).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
						this.cargarProveedores();
					}
				});
			}
		});
	}
	// #endregion
}