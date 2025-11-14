import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { IMovimientoCreateRequest } from '../../../../interfaces/request/IMovimientoCreateRequest.interface';
import { MovimientosService } from '../../../../services/movimientos.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IElementoSistemaListadoPorCodigoRequest } from '../../../../../../../configuracion/maestras/elemento-sistema/interfaces/request/IElementoSistemaListadoPorCodigoRequest.interface';
import { ElementoSistemaService } from '../../../../../../../configuracion/maestras/elemento-sistema/services/elemento-sistema.service';
import { IMovimientoCreateResponse } from '../../../../interfaces/response/IMovimientoCreateResponse.interface';

// Validador personalizado para 'no ser cero'
export const notZeroValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
	const value = control.value;
	return value === 0 ? { 'notZero': true } : null;
};

// Define la data que espera el diálogo
export interface MovimientoFormData {
	iIdAlmacen: number;
	iIdProducto: number;
}

@Component({
	selector: 'app-movimiento-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		DecimalPipe, // Para mostrar totales
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatIconModule,
		MatTooltipModule
	],
	templateUrl: './movimiento-form.html',
	styleUrl: './movimiento-form.scss'
})
export class MovimientoForm {
	// #region Inyecciones y Dependencias
	private fb = inject(FormBuilder);
	private movimientosService = inject(MovimientosService);
	private elementoSistemaService = inject(ElementoSistemaService);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<MovimientoForm>);
	// #endregion

	// #region Estado del Componente
	form: FormGroup;
	isLoading = signal(false);
	// #endregion

	isLoadingTipoMovimiento = signal(false);
	isLoadingTipoDocumento = signal(false);
	selectTipoMovimiento = signal<ISelectItem[]>([]);
	selectTipoDocumento = signal<ISelectItem[]>([]);

	constructor(@Inject(MAT_DIALOG_DATA) public data: MovimientoFormData) {
		// Define el formulario con validaciones
		this.form = this.fb.group({
			// IDs requeridos que vienen de la data
			iIdAlmacen: [data.iIdAlmacen, Validators.required],
			iIdProducto: [data.iIdProducto, Validators.required],

			// Campos del formulario
			iIdTipoMovimiento: [null, [Validators.required, Validators.min(1)]],
			dCantidad: [null, [Validators.required, notZeroValidator]], // Usa validador notZero
			dPrecioUnitario: [null, [Validators.min(0)]],
			iIdTipoDocumentoOrigen: [null, [Validators.min(1)]],
			iIdDocumentoOrigen: [null, [Validators.min(1)]],
			vObservacion: ['', [Validators.maxLength(1000)]]
		});
	}

	ngOnInit(): void {
		// Cargar selects
		this.cargarTipoMovimiento();
		this.cargarTipoDocumento();
	}

	// #region Carga de Datos (Selects)


	//#region LOAD SELECTS
	/*
	 * Carga la lista de Almacenes para el dropdown.
	 */
	cargarTipoMovimiento() {
		this.isLoadingTipoMovimiento.set(true);
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'ALMACEN_TIPO_MOVIMIENTO' };

		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipoMovimiento.set(false))) // Asegura que el spinner se oculte
			.subscribe({
				next: (paginatedResponse) => {
					this.selectTipoMovimiento.set(paginatedResponse.map(alm => ({
						iIdElemento: alm.iIdElemento,
						vDescripcion: alm.vDescripcion
					})));
				},
				error: (err) => {
					console.error('Error al cargar Tipos de Elemento:', err);
					this.selectTipoMovimiento.set([]);
				}
			});
	}

	cargarTipoDocumento() {
		this.isLoadingTipoMovimiento.set(true);
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'LOGISTICA_TIPO_DOCUMENTO' };

		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipoMovimiento.set(false))) // Asegura que el spinner se oculte
			.subscribe({
				next: (paginatedResponse) => {
					this.selectTipoDocumento.set(paginatedResponse.map(alm => ({
						iIdElemento: alm.iIdElemento,
						vDescripcion: alm.vDescripcion
					})));
				},
				error: (err) => {
					console.error('Error al cargar Tipos de Elemento:', err);
					this.selectTipoDocumento.set([]);
				}
			});
	}

	// #region Acciones del Diálogo
	/**
	 * Se ejecuta al hacer clic en Guardar.
	 */
	onSave(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			this.snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', {
				duration: 3000,
				panelClass: ['snackbar-warn']
			});
			return;
		}

		this.isLoading.set(true);
		const request = this.form.value as IMovimientoCreateRequest;

		this.movimientosService.crearMovimiento(request).pipe(
			finalize(() => this.isLoading.set(false)),
		).subscribe((response: IMovimientoCreateResponse) => {
			if (response && response.bStatus) {
				this.snackBar.open(response.vMensaje, 'Cerrar', {duration: 3000,panelClass: ['snackbar-success']});
				this.dialogRef.close(true);
			}
		});
	}

	/**
	 * Se ejecuta al hacer clic en Cancelar.
	 */
	onClose(): void {
		this.dialogRef.close(false); // Cierra el diálogo y devuelve 'false' (cancelado)
	}

	/**
	 * Calcula el total (Cantidad * Precio)
	 */
	get totalCalculado(): number {
		const cantidad = this.form.get('dCantidad')?.value || 0;
		const precio = this.form.get('dPrecioUnitario')?.value || 0;
		return cantidad * precio;
	}
	// #endregion
}
