import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { ITipoCambioResponse } from '../../interfaces/response/ITipoCambioResponse.interface';
import { TipoCambioService } from '../../services/tipo-cambio.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ITipoCambioListadoRequest } from '../../interfaces/request/ITipoCambioListadoRequest.interface';

@Component({
	selector: 'app-tipo-cambio-page',
	imports: [
		CommonModule,
		MatTableModule,
		MatProgressBarModule,
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
	],
	templateUrl: './tipo-cambio-page.html',
	styleUrl: './tipo-cambio-page.scss'
})
export class TipoCambioPage implements OnInit, OnDestroy {

	// #region Inyección de Dependencias
	private tipoCambioService = inject(TipoCambioService);
	public dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	// #endregion

	// #region Estado del Componente (Signals y Variables)
	isLoading = signal(false);
	data = signal<ITipoCambioResponse[]>([]);
	totalRecords = signal(0);
	pageSizeOptions = [10, 25, 50, 100]; // Ajusta según necesites
	currentPageSize = this.pageSizeOptions[0];
	currentPageIndex = 0;
	// #endregion

	// #region Referencias a Componentes Hijos
	@ViewChild(TableGeneric) tableGeneric!: TableGeneric<ITipoCambioResponse>;
	// #endregion

	// #region Configuración de la Tabla
	// Define las columnas a mostrar según ITipoCambioResponse
	aDisplayedColumns: string[] = ['select', 'dFecha', 'monedaOrigen', 'monedaDestino', 'dCompra', 'dVenta']; // Columnas recomendadas
	selection = new SelectionModel<ITipoCambioResponse>(true, []);
	tipoCambioActions: TableAction[] = [ // Acciones específicas
		{ name: 'edit', label: 'Editar T.C.', icon: 'edit' },
		{ name: 'delete', label: 'Eliminar T.C.', icon: 'delete' },
	];
	// #endregion

	// #region Filtrado (RxJS) - Adaptar a filtros específicos si es necesario
	private filterSubject = new Subject<string>(); // Este filtro es genérico, necesitarás adaptarlo para fechas/monedas
	private filterSubscription: Subscription | null = null;
	currentFilterValue = ''; // Valor actual del campo de búsqueda (considera objetos para filtros específicos)
	// #endregion

	// #region Ciclo de Vida del Componente
	ngOnInit(): void {
		this.cargarTiposCambio();
		this.setupFilterSubscription(); // Considera si este filtro genérico es útil o si necesitas filtros específicos
	}

	ngOnDestroy(): void {
		this.filterSubscription?.unsubscribe();
	}
	// #endregion

	// #region Carga de Datos
	/*
	 * Obtiene los tipos de cambio del servicio.
	 */
	cargarTiposCambio(): void {
		this.isLoading.set(true);
		this.selection.clear();

		const request: ITipoCambioListadoRequest = {
			iPageNumber: this.currentPageIndex + 1,
			iPageSize: this.currentPageSize,
		};

		this.tipoCambioService.listarTiposCambio(request).pipe(
			tap(response => {
				this.totalRecords.set(response.iTotalRecords);
				this.data.set(response.aRecords);
			}),
			catchError(error => {
				console.error('Error al cargar tipos de cambio:', error);
				this.snackBar.open(error.message || 'Error al cargar los tipos de cambio.', 'Cerrar', {
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
		this.cargarTiposCambio();
	}
	// #endregion

	// #region Manejo de Filtro
	/*
	 * Configura la suscripción al filtro (genérico, adaptar si es necesario).
	 */
	private setupFilterSubscription(): void {
		this.filterSubscription = this.filterSubject.pipe(
			debounceTime(400),
			distinctUntilChanged()
		).subscribe(filterValue => {
			this.currentFilterValue = filterValue; // Guardar valor para usar en cargarTiposCambio
			this.tableGeneric?.resetPaginator();
			this.currentPageIndex = 0;
			this.cargarTiposCambio(); // Recargar con el nuevo filtro genérico (si aplica)
		});
	}

	/*
	 * Aplica el filtro genérico desde el input (adaptar si es necesario).
	 */
	applyFilter(event: Event): void {
		const filterValue = (event.target as HTMLInputElement).value;
		// Envía el término de búsqueda al Subject (si tienes un filtro genérico)
		this.filterSubject.next(filterValue.trim());
		// Si usas filtros específicos, actualiza las variables correspondientes y llama a cargarTiposCambio()
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
	// #endregion

	// #region Manejo de Acciones de Fila
	/*
	 * Maneja clics en las acciones de fila.
	 */
	onActionClicked(event: { action: string, element: ITipoCambioResponse }): void {
		switch (event.action) {
			case 'edit':
				this.onEditTipoCambio(event.element);
				break;
			case 'delete':
				this.onDeleteTipoCambio(event.element);
				break;
			default:
				console.warn(`Acción desconocida: ${event.action}`);
		}
	}
	// #endregion

	// #region Apertura de Diálogos
	/*
	 * Abre diálogo para agregar tipo de cambio.
	 */
	onAddTipoCambio(): void {
		// Debes crear el componente TipoCambioForm
		// const dialogRef = this.dialog.open(TipoCambioForm, { width: '500px', disableClose: true, data: {} });
		// dialogRef.afterClosed().subscribe(result => {
		//   if (result) {
		//     console.log('Nuevo tipo de cambio:', result);
		//     // --- LLAMADA AL SERVICIO PARA CREAR ---
		//     // this.tipoCambioService.crearActualizarTipoCambio(result).subscribe(...);
		//     this.snackBar.open('Tipo de cambio creado (simulado).', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
		//     this.cargarTiposCambio();
		//   }
		// });
		alert('Funcionalidad "Agregar Tipo de Cambio" no implementada.'); // Placeholder
	}

	/*
	 * Abre diálogo para editar tipo de cambio.
	 */
	onEditTipoCambio(tipoCambio: ITipoCambioResponse): void {
		// const dialogRef = this.dialog.open(TipoCambioForm, { width: '500px', disableClose: true, data: { tipoCambio: tipoCambio } });
		// dialogRef.afterClosed().subscribe(result => {
		//   if (result) {
		//     console.log('Tipo de cambio a actualizar:', result);
		//     // --- LLAMADA AL SERVICIO PARA ACTUALIZAR ---
		//     // this.tipoCambioService.crearActualizarTipoCambio(result).subscribe(...);
		//     this.snackBar.open(`Tipo de cambio del ${this.formatDate(tipoCambio.dFecha)} actualizado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
		//     this.cargarTiposCambio();
		//   }
		// });
		alert(`Funcionalidad "Editar Tipo de Cambio del ${this.formatDate(tipoCambio.dFecha)}" no implementada.`); // Placeholder
	}

	/*
	 * Abre diálogo de confirmación para eliminar tipo de cambio.
	 */
	onDeleteTipoCambio(tipoCambio: ITipoCambioResponse): void {
		const dialogRef = this.dialog.open(Confirmacion, {
			width: '400px',
			data: {
				titulo: 'Confirmar Eliminación',
				// Mensaje más específico
				mensaje: `¿Estás seguro de eliminar el tipo de cambio ${tipoCambio.vMonedaOrigenSimbolo} -> ${tipoCambio.vMonedaDestinoSimbolo} del ${this.formatDate(tipoCambio.dFecha)}?`,
				mostrarCampoObservacion: false // O true si tu API lo requiere
			}
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result && result.confirmado) {
				// La clave es compuesta, necesitarás pasarla al servicio
				const key = {
					idOrigen: tipoCambio.iIdMonedaOrigen,
					idDestino: tipoCambio.iIdMonedaDestino,
					fecha: typeof tipoCambio.dFecha === 'string' ? tipoCambio.dFecha : tipoCambio.dFecha.toISOString().split('T')[0] // Asegura formato YYYY-MM-DD
				};
				console.log('Eliminando tipo de cambio:', key, 'Observación:', result.observacion);
				// --- LLAMADA AL SERVICIO PARA ELIMINAR ---
				// this.tipoCambioService.eliminarTipoCambio(key, result.observacion).subscribe(...);
				this.snackBar.open(`Tipo de cambio del ${this.formatDate(tipoCambio.dFecha)} eliminado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
				this.cargarTiposCambio();
			}
		});
	}
	// #endregion

	// #region Utilidades (Ej: Formatear fecha para mensajes)
	/*
	 * Formatea una fecha para mostrar en mensajes.
	 * @param date Fecha (string o Date)
	 * @returns Fecha formateada o string vacío.
	 */
	private formatDate(date: string | Date | null): string {
		if (!date) return '';
		// Puedes usar DatePipe o Intl.DateTimeFormat para un formato más robusto
		try {
			const d = typeof date === 'string' ? new Date(date) : date;
			// Ajusta el formato según necesites
			return d.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
		} catch (e) {
			return typeof date === 'string' ? date : ''; // Devuelve el string original si falla
		}
	}
	// #endregion
}