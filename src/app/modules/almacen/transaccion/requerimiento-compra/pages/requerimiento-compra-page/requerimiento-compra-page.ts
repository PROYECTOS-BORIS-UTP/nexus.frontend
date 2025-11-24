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
import { IRequerimientoCompraCreateUpdateRequest } from '../../interfaces/request/IRequerimientoCompraCreateUpdateRequest.interface';
import { IRequerimientoCompraListadoRequest } from '../../interfaces/request/IRequerimientoCompraListadoRequest.interface';
import { IRequerimientoCompraListadoResponse } from '../../interfaces/response/IRequerimientoCompraListadoResponse.interface';
import { RequerimientoCompraService } from '../../services/requerimiento-compra.service';
import { RequerimientoCompraForm } from './dialogs/requerimiento-compra-form/requerimiento-compra-form';
import { IRequerimientoCompraDeleteResponse } from '../../interfaces/response/IRequerimientoCompraDeleteResponse.interface';

@Component({
	selector: 'app-requerimiento-compra-page',
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
	templateUrl: './requerimiento-compra-page.html',
	styleUrl: './requerimiento-compra-page.scss'
})
export class RequerimientoCompraPage {
	// #region Inyección de Dependencias
	private requerimientoCompraService = inject(RequerimientoCompraService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<IRequerimientoCompraListadoResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50];
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<IRequerimientoCompraListadoResponse>;
	// #endregion

	// #region Configuración de la Tabla
	aDisplayedColumns: string[] = ['select', 'vNumero', 'dFechaSolicitud', 'vUsuarioSolicitanteNombre', 'vCentroCostoNombre', 'vJustificacion', 'vEstadoNombre'];
	selection = new SelectionModel<IRequerimientoCompraListadoResponse>(true, []);
	requerimientoActions: TableAction[] = [
		{ name: 'edit', label: 'Editar R.C.', icon: 'edit' },
		{ name: 'delete', label: 'Anular R.C.', icon: 'cancel' }, // 'delete' mapea a anular
		// { name: 'detail', label: 'Ver Detalle', icon: 'visibility' }, // Podrías añadir esto
	];
	// #endregion

	// #region Filtrado (RxJS)
	private filterSubject = new Subject<string>();
	private filterSubscription: Subscription | null = null;
	currentFilterValue = ''; // Se mapeará a vNumero
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
	/**
	 * Obtiene los requerimientos del servicio.
	 */
	cargarRequerimientos(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: IRequerimientoCompraListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
			sTerminoBusqueda: this.currentFilterValue || undefined,
			// Aquí podrías añadir otros filtros (Compañía, Estado, Fechas) si los implementas
		};

		this.requerimientoCompraService.listarRequerimientosCompra(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				// El servicio ya muestra el snackbar
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
	/**
	 * Maneja los eventos del paginador.
	 */
	handlePageEvent(event: PageEvent): void {
		this.currentPageIndex = event.pageIndex;
		this.currentPageSize = event.pageSize;
		this.cargarRequerimientos();
	}
	// #endregion

	// #region Manejo de Filtro
	/**
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
			this.cargarRequerimientos();
		});
	}

	/**
	 * Aplica el filtro desde el input.
	 */
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
	/*
	 * Maneja clics en las acciones de fila.
	 */
	onActionClicked(event: { action: string, element: IRequerimientoCompraListadoResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditRequerimiento(event.element);
				break;
			case 'delete':
				this.onDeleteRequerimiento(event.element);
				break;
			// case 'detail':
			//   this.onViewDetail(event.element); // Lógica para ver detalle
			//   break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar requerimiento.
	 */
	onAddRequerimiento(): void {
		const dialogRef = this.dialog.open(RequerimientoCompraForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: {}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) { // Si el form devolvió 'true'
				this.cargarRequerimientos(); // Recarga la tabla
			}
		});
	}

	/**
	 * Abre diálogo para editar requerimiento.
	 */
	onEditRequerimiento(requerimiento: IRequerimientoCompraListadoResponse): void {
		// Mapea la respuesta del listado al formato que espera el formulario (DTO inferido)
		const dataParaForm: IRequerimientoCompraCreateUpdateRequest = {
			iIdRequerimientoCompra: requerimiento.iIdRequerimientoCompra,
			iIdCompania: requerimiento.iIdCompania,
			vSerie: requerimiento.vSerie,
			vNumero: requerimiento.vNumero,
			dFechaSolicitud: (requerimiento.dFechaSolicitud as string).split('T')[0], // Formato YYYY-MM-DD
			dFechaNecesidad: requerimiento.dFechaNecesidad ? (requerimiento.dFechaNecesidad as string).split('T')[0] : null,
			iIdCentroCosto: requerimiento.iIdCentroCosto,
			iIdUsuarioSolicitante: requerimiento.iIdUsuarioSolicitante,
			iIdEstado: requerimiento.iIdEstado,
			vJustificacion: requerimiento.vJustificacion
		};

		const dialogRef = this.dialog.open(RequerimientoCompraForm, {
			width: '100%',
			maxWidth: '1050px',
			disableClose: true,
			data: { requerimiento: dataParaForm } // Envía los datos mapeados
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.cargarRequerimientos(); // Recarga la tabla
			}
		});
	}

	/*
	 * Abre diálogo de confirmación para anular requerimiento.
	 */
	onDeleteRequerimiento(requerimiento: IRequerimientoCompraListadoResponse): void {
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
				this.requerimientoCompraService.anularRequerimientoCompra(requerimiento.iIdRequerimientoCompra).pipe(
					finalize(() => this.isLoading.set(false)),
				).subscribe((response: IRequerimientoCompraDeleteResponse) => {
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
