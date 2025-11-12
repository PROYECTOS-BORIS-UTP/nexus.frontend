import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IRequerimientoCompraCreateUpdateRequest } from '../../../../interfaces/request/IRequerimientoCompraCreateUpdateRequest.interface';
import { RequerimientoCompraService } from '../../../../services/requerimiento-compra.service';

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
	public dialogRef = inject(MatDialogRef<RequerimientoCompraForm>);
	// (Inyecta servicios para selects)
	// private companiaService = inject(CompaniaService);
	// private centroCostoService = inject(CentroCostoService);
	// #endregion

	// #region Estado del Componente
	form: FormGroup;
	isEdit = signal(false);
	isLoading = signal(false);
	// #endregion

	// #region Datos (Selects) - (Simulados, debes cargarlos)
	isLoadingCompanias = signal(false);
	selectCompanias = signal<ISelectItem[]>([]);
	isLoadingCentrosCosto = signal(false);
	selectCentrosCosto = signal<ISelectItem[]>([]);
	// #endregion

	constructor(@Inject(MAT_DIALOG_DATA) public data: RequerimientoCompraFormData) {
		this.isEdit.set(!!data.requerimiento);

		// Define el formulario basado en el DTO Create/Update (inferido)
		this.form = this.fb.group({
			iIdRequerimientoCompra: [0],
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			dFechaSolicitud: [new Date(), [Validators.required]], // Por defecto hoy
			dFechaNecesidad: [null], // Opcional
			iIdCentroCosto: [null, [Validators.required, Validators.min(1)]],
			vJustificacion: [null, [Validators.maxLength(500)]]
		});
	}

	ngOnInit(): void {
		if (this.isEdit() && this.data.requerimiento) {
			// Parchea el formulario. Asegúrate de convertir las fechas de string a Date si es necesario
			const data = this.data.requerimiento;
			this.form.patchValue({
				...data,
				// Asegura que las fechas sean objetos Date para el datepicker
				dFechaSolicitud: data.dFechaSolicitud ? new Date(data.dFechaSolicitud + 'T00:00:00') : null, // Ajusta zona horaria si es necesario
				dFechaNecesidad: data.dFechaNecesidad ? new Date(data.dFechaNecesidad + 'T00:00:00') : null
			});
		}

		this.cargarDatosSelects();
	}

	// #region Carga de Datos (Selects)
	/**
	 * Carga datos para los selects (Compañías, Centros de Costo)
	 * DEBES REEMPLAZAR ESTO con llamadas a servicios reales.
	 */
	cargarDatosSelects(): void {
		// Cargar Compañías (Simulado)
		this.isLoadingCompanias.set(true);
		// this.companiaService.listarCompaniasSimple().pipe(finalize(...)).subscribe(...)
		setTimeout(() => {
			this.selectCompanias.set([
				{ iIdElemento: 1, vDescripcion: 'Mi Empresa S.A.C. (Simulado)' }
			]);
			this.isLoadingCompanias.set(false);
		}, 500);

		// Cargar Centros de Costo (Simulado)
		this.isLoadingCentrosCosto.set(true);
		// this.centroCostoService.listarCentrosCostoSimple().pipe(finalize(...)).subscribe(...)
		setTimeout(() => {
			this.selectCentrosCosto.set([
				{ iIdElemento: 1, vDescripcion: 'Operaciones (Simulado)' },
				{ iIdElemento: 2, vDescripcion: 'Administración (Simulado)' }
			]);
			this.isLoadingCentrosCosto.set(false);
		}, 500);
	}
	// #endregion

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
		const formValue = this.form.value;

		// Prepara el request, formateando las fechas a string YYYY-MM-DD
		const request: IRequerimientoCompraCreateUpdateRequest = {
			...formValue,
			dFechaSolicitud: this.formatDate(formValue.dFechaSolicitud),
			dFechaNecesidad: this.formatDate(formValue.dFechaNecesidad)
		};

		this.requerimientoCompraService.crearActualizarRequerimientoCompra(request).pipe(
			finalize(() => this.isLoading.set(false)),
			catchError(error => of(null)) // El servicio ya maneja el snackbar
		).subscribe(response => {
			if (response && response.bStatus) {
				this.snackBar.open(response.vMensaje, 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.dialogRef.close(true); // Cierra y devuelve 'true' (éxito)
			}
		});
	}

	/**
	 * Se ejecuta al hacer clic en Cancelar.
	 */
	onClose(): void {
		this.dialogRef.close(false); // Cierra y devuelve 'false' (cancelado)
	}

	/**
	 * Formatea un objeto Date a string 'YYYY-MM-DD' o devuelve null.
	 */
	private formatDate(date: Date | string | null): string | null {
		if (!date) return null;
		try {
			const d = new Date(date);
			// Ajuste para zona horaria (obtener YYYY-MM-DD local)
			d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			return d.toISOString().split('T')[0];
		} catch (e) {
			return null;
		}
	}
	// #endregion
}
