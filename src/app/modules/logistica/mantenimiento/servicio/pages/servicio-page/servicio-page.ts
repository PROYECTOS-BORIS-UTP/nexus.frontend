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
import { IServicioListadoRequest } from '../../interfaces/request/IServicioListadoRequest.interface';
import { IServicioResponse } from '../../interfaces/response/IServicioResponse.interface';
import { ServicioService } from '../../services/servicio.service';
import { ServicioForm } from './dialogs/servicio-form/servicio-form';

@Component({
	selector: 'app-servicio-page',
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
	templateUrl: './servicio-page.html',
	styleUrl: './servicio-page.scss'
})
export class ServicioPage {
	// #region Inyección de Dependencias
	private servicioService = inject(ServicioService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(false);
	data = signal<IServicioResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IServicioResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vTitulo', 'vDescripcion', 'bActivo'];
	selection = new SelectionModel<IServicioResponse>(true, []);
	servicioActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Servicio', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar Servicio', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		this.cargarServicios();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarServicios(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IServicioListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			vTitulo: this.currentFilterValue || undefined,
		};

		this.servicioService.listarServicios(request).pipe(
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
		this.cargarServicios();
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
			this.cargarServicios();
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
	onActionClicked(event: { action: string, element: IServicioResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditServicio(event.element);
				break;
			case 'delete':
				this.onDeleteServicio(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddServicio(): void {
		const dialogRef = this.dialog.open(ServicioForm, {
			width: '600px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarServicios();
			}
		});
	}

	onEditServicio(servicio: IServicioResponse): void {
		const dialogRef = this.dialog.open(ServicioForm, {
			width: '600px',
			disableClose: true,
			data: { servicio: servicio }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarServicios();
			}
		});
	}

	onDeleteServicio(servicio: IServicioResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				mensaje: `¿Estás seguro de eliminar el servicio "${servicio.vTitulo}"?`,
				mostrarCampoObservacion: false
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.servicioService.eliminarServicio({ iIdServicio: servicio.iIdServicio }).pipe(
					finalize(() => this.isLoading.set(false)),
					catchError(error => of(null))
				).subscribe(response => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
						this.cargarServicios();
					}
				});
			}
		});
	}
	// #endregion
}
