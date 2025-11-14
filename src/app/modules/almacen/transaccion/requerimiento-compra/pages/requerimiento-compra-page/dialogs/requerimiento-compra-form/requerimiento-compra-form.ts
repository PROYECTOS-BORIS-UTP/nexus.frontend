import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, of, forkJoin, switchMap } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IRequerimientoCompraCreateUpdateRequest } from '../../../../interfaces/request/IRequerimientoCompraCreateUpdateRequest.interface';
import { RequerimientoCompraService } from '../../../../services/requerimiento-compra.service';
import { IRequerimientoCompraDetalleListadoRequest } from '../../../../interfaces/request/IRequerimientoCompraDetalleListadoRequest.interface';
import { IRequerimientoCompraDetalleCreateUpdateRequest } from '../../../../interfaces/request/IRequerimientoCompraDetalleCreateUpdateRequest';
import { IRequerimientoCompraCreateUpdateResponse } from '../../../../interfaces/response/IRequerimientoCompraCreateUpdateResponse.interface';
import { ICompaniaListadoRequest } from '../../../../../../../configuracion/maestras/compania/interfaces/request/ICompaniaListadoRequest.interface';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';
import { ProductoSelector } from '../../../../../../mantenimiento/almacen/pages/almacen-page/dialogs/almacen-form/dialogs/producto-selector/producto-selector';
import { IProductoCatalogo } from '../../../../../../mantenimiento/almacen/pages/almacen-page/dialogs/almacen-form/dialogs/interfaces/IProductoCatalogo.interface';

export interface RequerimientoCompraFormData {
	requerimiento?: IRequerimientoCompraCreateUpdateRequest; // Usa el DTO inferido
}

@Component({
	selector: 'app-requerimiento-compra-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatIconModule,
		MatDatepickerModule,
		MatNativeDateModule
	],
	templateUrl: './requerimiento-compra-form.html',
	styleUrl: './requerimiento-compra-form.scss'
})
export class RequerimientoCompraForm {
	// #region Inyecciones y Dependencias
	private fb = inject(FormBuilder);
	private requerimientoCompraService = inject(RequerimientoCompraService);
	private snackBar = inject(MatSnackBar);
	private companiaService = inject(CompaniaService);
	public dialogRef = inject(MatDialogRef<RequerimientoCompraForm>);
	private dialogService = inject(MatDialog);
	// (Inyecta servicios para selects)
	// private centroCostoService = inject(CentroCostoService);
	// #endregion

	// #region Estado del Componente
	form: FormGroup;
	isEdit = signal(false);
	isLoading = signal(false);
	// #endregion

	// Almacena IDs de detalles que el usuario elimina visualmente para borrarlos en BD al guardar
	detallesEliminados: number[] = [];
	// #endregion

	// #region Datos (Selects) - (Simulados, debes cargarlos)
	isLoadingCompanias = signal(false);
	selectCompanias = signal<ISelectItem[]>([]);
	isLoadingCentrosCosto = signal(false);
	selectCentrosCosto = signal<ISelectItem[]>([]);
	// #endregion

	selectProductos = signal<ISelectItem[]>([]);
	selectUnidades = signal<ISelectItem[]>([]);

	constructor(@Inject(MAT_DIALOG_DATA) public data: RequerimientoCompraFormData) {
		this.isEdit.set(!!data.requerimiento);

		// Define el formulario basado en el DTO Create/Update (inferido)
		this.form = this.fb.group({
			iIdRequerimientoCompra: [0],
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			vSerie: [{ value: 'REQCOM', disabled: true }, Validators.required],
			vNumero: [{ value: '', disabled: true }],
			dFechaSolicitud: [new Date(), [Validators.required]], // Por defecto hoy
			dFechaNecesidad: [null], // Opcional
			iIdCentroCosto: [null, [Validators.required, Validators.min(1)]],
			vJustificacion: [null, [Validators.maxLength(500)]],
			detalles: this.fb.array([])
		});
	}

	ngOnInit(): void {
		this.cargarCompanias();
		this.cargarDatosSelects(); // Carga maestros (Compañías, Productos, etc.)

		if (this.isEdit() && this.data.requerimiento) {
			this.cargarDatosEdicion();
		} else {
			this.form.get('vNumero')?.setValue('---');
		}
	}

	// Getter para facilitar acceso al FormArray en el HTML
	get detallesArr(): FormArray {
		return this.form.get('detalles') as FormArray;
	}

	// #region Gestión de Detalles

	/** Agrega una nueva fila a la tabla */
	abrirSelectorProductos(): void {
		const dialogRef = this.dialogService.open(ProductoSelector, {
			width: '100%',
			maxWidth: '700px',
			disableClose: false
		});

		dialogRef.afterClosed().subscribe((productosSeleccionados: IProductoCatalogo[]) => {
			if (productosSeleccionados && productosSeleccionados.length > 0) {
				productosSeleccionados.forEach(prod => {
					const existe = this.detallesArr.controls.some(
						ctrl => ctrl.get('iIdProducto')?.value === prod.iIdProducto
					);

					if (!existe) {
						this.detallesArr.push(this.crearDetalleGroup({
							iIdProducto: prod.iIdProducto,
							vProductoNombre: prod.vDescripcion,
							iIdUnidadMedida: prod.iIdUnidadMedida,
							dCantidadSolicitada: 1,
							vObservacion: ''
						}));
					}
				});
				this.mostrarSnack(`${productosSeleccionados.length} productos agregados.`, 'snackbar-success');
			}
		});
	}

	/** Crea un FormGroup para una fila de la tabla */
	crearDetalleGroup(data?: any): FormGroup {
		return this.fb.group({
			iIdRequerimientoCompraDetalle: [data?.iIdRequerimientoCompraDetalle || 0],
			iIdProducto: [data?.iIdProducto || null, Validators.required],
			// Campo auxiliar para mostrar el nombre en modo lectura (readonly)
			vProductoNombre: [data?.vProductoNombre || 'Producto Cargado', Validators.required],
			dCantidadSolicitada: [data?.dCantidadSolicitada || null, [Validators.required, Validators.min(0.01)]],
			iIdUnidadMedida: [data?.iIdUnidadMedida || null, Validators.required],
			vObservacion: [data?.vObservacion || null]
		});
	}

	/** Elimina una fila de la tabla visualmente y marca para borrar en BD si ya existía */
	eliminarDetalle(index: number): void {
		const group = this.detallesArr.at(index) as FormGroup;
		const idDetalle = group.value.iIdRequerimientoCompraDetalle;

		// Si tiene ID > 0, significa que ya existe en base de datos
		if (idDetalle > 0) {
			this.detallesEliminados.push(idDetalle);
		}

		this.detallesArr.removeAt(index);
	}

	// #endregion

	// #region Carga de Datos (Selects)

	cargarCompanias(): void {
		this.isLoadingCompanias.set(true);
		const request: ICompaniaListadoRequest = {
			iPageNumber: 1,
			iPageSize: 1000,
		};

		this.companiaService.listarCompanias(request)
			.pipe(finalize(() => this.isLoadingCompanias.set(false)))
			.subscribe({
				next: (paginatedResponse) => {
					this.selectCompanias.set(
						paginatedResponse.aRecords.map(comp => ({
							iIdElemento: comp.iIdCompania,
							vDescripcion: comp.vRazonSocial
						}))
					);
				},
				error: (err) => {
					console.error('Error al cargar Compañías:', err);
					this.selectCompanias.set([]);
				}
			});
	}

	/*
	 * Carga datos para los selects (Compañías, Centros de Costo)
	 * DEBES REEMPLAZAR ESTO con llamadas a servicios reales.
	 */
	cargarDatosSelects(): void {
		// Simulación de carga de datos maestros. 
		// TODO: Reemplazar con llamadas reales a tus servicios (ProductoService, UnidadMedidaService, etc.)

		this.isLoadingCompanias.set(true);
		setTimeout(() => {
			this.selectCentrosCosto.set([{ iIdElemento: 1, vDescripcion: 'Logística' }, { iIdElemento: 2, vDescripcion: 'TI' }]);

			// Datos para el detalle
			this.selectProductos.set([
				{ iIdElemento: 1, vDescripcion: 'Laptop Lenovo' },
				{ iIdElemento: 2, vDescripcion: 'Papel Bond A4' },
				{ iIdElemento: 3, vDescripcion: 'Toner Impresora' }
			]);
			this.selectUnidades.set([
				{ iIdElemento: 1, vDescripcion: 'UND' },
				{ iIdElemento: 2, vDescripcion: 'CJA' },
				{ iIdElemento: 3, vDescripcion: 'MILLAR' }
			]);

			this.isLoadingCompanias.set(false);
		}, 300);
	}
	// #endregion

	cargarDatosEdicion() {
		const req = this.data.requerimiento!;
		// 1. Cargar Cabecera
		this.form.patchValue({
			...req,
			// vSerie: req.vSerie,
			// vNumero: req.vNumero,
			dFechaSolicitud: req.dFechaSolicitud ? new Date(req.dFechaSolicitud + 'T00:00:00') : null,
			dFechaNecesidad: req.dFechaNecesidad ? new Date(req.dFechaNecesidad + 'T00:00:00') : null
		});

		// 2. Cargar Detalles (Llamada al API)
		this.isLoading.set(true);
		const payload: IRequerimientoCompraDetalleListadoRequest = {
			iIdRequerimientoCompra: req.iIdRequerimientoCompra,
			iPageNumber: 1,
			iPageSize: 1000 // Traemos todos sin paginar visualmente en el form
		};

		this.requerimientoCompraService.listarDetallesRequerimientoCompra(payload)
			.pipe(finalize(() => this.isLoading.set(false)))
			.subscribe({
				next: (resp) => {
					if (resp && resp.aRecords) {
						// Limpiar array inicial (si hubiera)
						this.detallesArr.clear();
						// Poblar con datos del backend
						resp.aRecords.forEach((det: any) => {
							this.detallesArr.push(this.crearDetalleGroup(det));
						});
					}
				},
				error: (err) => console.error('Error cargando detalles', err)
			});
	}

	// #endregion

	// #region Acciones del Diálogo
	/*
	 * Se ejecuta al hacer clic en Guardar.
	 */
	onSave(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			this.mostrarSnack('Por favor, complete los campos obligatorios.', 'snackbar-warn');
			return;
		}

		// Validación de Negocio: Al menos un detalle
		if (this.detallesArr.length === 0) {
			this.mostrarSnack('Debe agregar al menos un producto al requerimiento.', 'snackbar-warn');
			return;
		}

		this.isLoading.set(true);
		const formVal = this.form.getRawValue();

		const numeroEnvio = this.isEdit() ? formVal.vNumero : '';

		// 1. Preparar DTO Cabecera
		const requestCabecera: IRequerimientoCompraCreateUpdateRequest = {
			iIdRequerimientoCompra: formVal.iIdRequerimientoCompra,
			iIdCompania: formVal.iIdCompania,
			vSerie: formVal.vSerie,
			vNumero: numeroEnvio,
			dFechaSolicitud: this.formatDate(formVal.dFechaSolicitud)!,
			dFechaNecesidad: this.formatDate(formVal.dFechaNecesidad),
			iIdCentroCosto: formVal.iIdCentroCosto,
			iIdUsuarioSolicitante: 1, // TODO: Obtener del token/auth service
			iIdEstado: 1, // Estado Pendiente por defecto al crear/editar
			vJustificacion: formVal.vJustificacion
		};

		// 2. Flujo RxJS: Guardar Cabecera -> Obtener ID -> Guardar Detalles
		this.requerimientoCompraService.crearActualizarRequerimientoCompra(requestCabecera).pipe(
			switchMap((respCabecera: IRequerimientoCompraCreateUpdateResponse) => {
				// El ID confirmado de la cabecera (sea nueva o existente)
				const idCabecera = respCabecera.iIdRequerimientoCompra;

				if (respCabecera.vNumero) {
					this.form.patchValue({
						vNumero: respCabecera.vNumero,
						iIdRequerimientoCompra: idCabecera // Actualizamos ID para pasar a modo edición
					});
					this.isEdit.set(true); // Cambiamos estado visual a edición
				}

				// Array de observables para operaciones en paralelo
				const peticionesDetalle = [];

				// A) Guardar/Actualizar cada fila de la tabla
				for (let control of this.detallesArr.controls) {
					if (control.invalid) continue; // Opcional: saltar inválidos o lanzar error

					const detVal = control.value;
					const reqDetalle: IRequerimientoCompraDetalleCreateUpdateRequest = {
						iIdRequerimientoCompraDetalle: detVal.iIdRequerimientoCompraDetalle,
						iIdRequerimientoCompra: idCabecera, // Vincular al ID padre
						iIdProducto: detVal.iIdProducto,
						iIdUnidadMedida: detVal.iIdUnidadMedida,
						dCantidadSolicitada: detVal.dCantidadSolicitada,
						vObservacion: detVal.vObservacion
					};

					peticionesDetalle.push(
						this.requerimientoCompraService.crearActualizarDetalleRequerimientoCompra(reqDetalle)
					);
				}

				// B) Eliminar filas que el usuario quitó (solo si existen en BD)
				this.detallesEliminados.forEach(idEliminar => {
					peticionesDetalle.push(
						this.requerimientoCompraService.eliminarDetalleRequerimientoCompra(idEliminar)
					);
				});

				// Ejecutar todas las peticiones de detalle en paralelo
				// Si no hay cambios en detalle, forkJoin([]) completa inmediatamente con []
				return peticionesDetalle.length > 0 ? forkJoin(peticionesDetalle) : of([]);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe({
			next: () => {
				this.mostrarSnack('Requerimiento guardado exitosamente.', 'snackbar-success');
				// this.dialogRef.close(true);
			},
			error: (err: any) => {
				console.error("Error en proceso de guardado:", err);
				this.mostrarSnack('Ocurrió un error al guardar el requerimiento.', 'snackbar-error');
			}
		});
	}

	// #endregion

	// #region Helpers
	onClose(): void {
		this.dialogRef.close(true);
	}

	private formatDate(date: Date | string | null): string | null {
		if (!date) return null;
		try {
			const d = new Date(date);
			d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			return d.toISOString().split('T')[0];
		} catch { return null; }
	}

	private mostrarSnack(mensaje: string, clase: string) {
		this.snackBar.open(mensaje, 'Cerrar', {
			duration: 3000,
			panelClass: [clase]
		});
	}
	// #endregion
}