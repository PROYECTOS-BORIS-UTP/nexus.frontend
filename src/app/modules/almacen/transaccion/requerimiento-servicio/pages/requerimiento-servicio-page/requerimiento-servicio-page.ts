import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
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
import { IRequerimientoServicioCreateUpdateRequest } from '../../interfaces/request/IRequerimientoServicioCreateUpdateRequest.interface';
import { IRequerimientoServicioListadoRequest } from '../../interfaces/request/IRequerimientoServicioListadoRequest.interface';
import { IRequerimientoServicioListadoResponse } from '../../interfaces/response/IRequerimientoServicioListadoResponse.interface';
import { RequerimientoServicioService } from '../../services/requerimiento-servicio.service';
import { IRequerimientoServicioDeleteResponse } from '../../interfaces/response/IRequerimientoServicioDeleteResponse.interface';
import { RequerimientoServicioForm } from './dialogs/requerimiento-servicio-form/requerimiento-servicio-form';

@Component({
	selector: 'app-requerimiento-servicio-page',
	imports: [
		CommonModule,
		DatePipe,
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
	templateUrl: './requerimiento-servicio-page.html',
	styleUrl: './requerimiento-servicio-page.scss'
})
export class RequerimientoServicioPage {
	// #region Inyección de Dependencias
	private requerimientoServicioService = inject(RequerimientoServicioService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IRequerimientoServicioListadoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IRequerimientoServicioListadoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumero', 'dFechaSolicitud', 'vUsuarioSolicitanteNombre', 'vCentroCostoNombre', 'vJustificacion', 'vEstadoNombre'];
	selection = new SelectionModel<IRequerimientoServicioListadoResponse>(true, []);
	requerimientoActions: TableAction[] = [
		{ name: 'edit', label: 'Editar R.S.', icon: 'edit' },
		{ name: 'delete', label: 'Anular R.S.', icon: 'cancel' },
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = '';
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarRequerimientos();
		this.setupFilterSubscription();
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	cargarRequerimientos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IRequerimientoServicioListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined,
		};

		this.requerimientoServicioService.listarRequerimientosServicio(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar requerimientos:', error);
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
		this.cargarRequerimientos();
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
			this.cargarRequerimientos();
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
	onActionClicked(event: { action: string, element: IRequerimientoServicioListadoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditRequerimiento(event.element);
				break;
			case 'delete':
				this.onDeleteRequerimiento(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	onAddRequerimiento(): void {
		const dialogRef = this.dialog.open(RequerimientoServicioForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarRequerimientos();
			}
		});
	}

	onEditRequerimiento(requerimiento: IRequerimientoServicioListadoResponse): void {
		const dataParaForm: IRequerimientoServicioCreateUpdateRequest = {
			iIdRequerimientoServicio: requerimiento.iIdRequerimientoServicio,
			iIdCompania: requerimiento.iIdCompania,
			vSerie: requerimiento.vSerie,
			vNumero: requerimiento.vNumero,
			dFechaSolicitud: (requerimiento.dFechaSolicitud as string).split('T')[0],
			iIdUsuarioSolicitante: requerimiento.iIdUsuarioSolicitante,
			iIdCentroCosto: requerimiento.iIdCentroCosto,
			iIdEstado: requerimiento.iIdEstado,
			vJustificacion: requerimiento.vJustificacion
		};

		const dialogRef = this.dialog.open(RequerimientoServicioForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: { requerimiento: dataParaForm }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarRequerimientos();
			}
		});
	}

	onDeleteRequerimiento(requerimiento: IRequerimientoServicioListadoResponse): void {
		if (requerimiento.vEstadoNombre?.toLowerCase() !== 'pendiente') {
			this.snackBar.open(`No se puede anular un requerimiento en estado "${requerimiento.vEstadoNombre}".`, 'Cerrar', {
				duration: 4000, panelClass: ['snackbar-warn']
			});
			return;
		}

		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Anulación',
				mensaje: `¿Estás seguro de ANULAR el Requerimiento "${requerimiento.vSerie}-${requerimiento.vNumero}"?`,
				mostrarCampoObservacion: true,
				labelObservacion: 'Motivo de anulación (Opcional)'
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				this.isLoading.set(true);
				this.requerimientoServicioService.anularRequerimientoServicio(requerimiento.iIdRequerimientoServicio).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: IRequerimientoServicioDeleteResponse) => {
					if (response && response.bStatus) {
						this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
						this.cargarRequerimientos();
					}
				});
			}
		});
	}
	// #endregion
}
