import { Component, inject, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { IAlmacenCreateUpdateRequest } from '../../../../interfaces/request/IAlmacenCreateUpdateRequest.interface';
import { IAlmacenResponse } from '../../../../interfaces/response/IAlmacenResponse.interface';
import { AlmacenService } from '../../../../services/almacen.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { ICompaniaListadoRequest } from '../../../../../../../configuracion/maestras/compania/interfaces/request/ICompaniaListadoRequest.interface';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';

export interface AlmacenFormData {
	almacen?: IAlmacenResponse;
}

@Component({
	selector: 'app-almacen-form',
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
		MatSlideToggleModule
	],
	templateUrl: './almacen-form.html',
	styleUrl: './almacen-form.scss'
})
export class AlmacenForm {
	// #region Inyecciones y Dependencias
	private fb = inject(FormBuilder);
	private almacenService = inject(AlmacenService);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<AlmacenForm>);
	private companiaService = inject(CompaniaService);
	// #endregion

	// #region Estado del Componente
	almacenForm: FormGroup;
	isEdit = signal(false);
	isLoading = signal(false);
	// #endregion

	// #region Datos (Selects) - (Simulados, debes cargarlos)
	// Deberías cargar estos datos desde servicios correspondientes
	companias = signal<any[]>([]); // Ejemplo: [{ iIdCompania: 1, vRazonSocial: 'Mi Compañía' }]
	ubigeos = signal<any[]>([]);   // Ejemplo: [{ iIdUbigeo: 150101, vDescripcion: 'LIMA' }]
	// #endregion

	selectCompanias: ISelectItem[] = []; // Usar ISelectItem si aplica
	isLoadingCompanias = false;

	constructor(@Inject(MAT_DIALOG_DATA) public data: AlmacenFormData) {
		this.isEdit.set(!!data.almacen); // Determina si es edición

		// Define el formulario con validaciones
		this.almacenForm = this.fb.group({
			iIdAlmacen: [0], // Siempre presente, 0 para crear
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vNombre: ['', [Validators.required, Validators.maxLength(255)]],
			vDireccion: ['', [Validators.maxLength(500)]],
			iIdUbigeo: [null, [Validators.min(1)]],
			bActivo: [true, [Validators.required]]
		});
	}

	ngOnInit(): void {
		
		if (this.isEdit() && this.data.almacen) {
			// Mapea la respuesta del listado al DTO de Create/Update
			const almacenData: IAlmacenCreateUpdateRequest = {
				iIdAlmacen: this.data.almacen.iIdAlmacen,
				iIdCompania: this.data.almacen.iIdCompania,
				vCodigo: this.data.almacen.vCodigo,
				vNombre: this.data.almacen.vNombre,
				vDireccion: this.data.almacen.vDireccion,
				iIdUbigeo: this.data.almacen.iIdUbigeo,
				bActivo: this.data.almacen.bActivo
			};
			this.almacenForm.patchValue(almacenData);
		}

		// Cargar selects (simulado)
		this.cargarDatosSelects();
		this.cargarCompanias();
	}

	// #region Carga de Datos (Selects)

	cargarCompanias(): void {
		this.isLoadingCompanias = true;
		const request: ICompaniaListadoRequest = {
			iPageNumber: 1,
			iPageSize: 1000,
		};

		this.companiaService.listarCompanias(request)
			.pipe(finalize(() => this.isLoadingCompanias = false))
			.subscribe({
				next: (paginatedResponse) => {
					this.selectCompanias = paginatedResponse.aRecords.map(comp => ({
						iIdElemento: comp.iIdCompania,
						vDescripcion: comp.vRazonSocial
					}));
				},
				error: (err) => {
					console.error('Error al cargar Compañías:', err);
					this.selectCompanias = [];
				}
			});
	}

	/*
	 * Simula la carga de datos para los selects (Compañías, Ubigeos)
	 * DEBES REEMPLAZAR ESTO con llamadas a servicios reales.
	 */
	cargarDatosSelects(): void {
		// Simulación (reemplazar con servicios reales)
		this.ubigeos.set([
			{ iIdUbigeo: 1, vDescripcion: 'LIMA / LIMA / LIMA' },
			{ iIdUbigeo: 2, vDescripcion: 'LIMA / LIMA / ANCÓN' }
		]);
	}
	// #endregion

	// #region Acciones del Diálogo
	/*
	 * Se ejecuta al hacer clic en Guardar.
	 * Valida el formulario y llama al servicio.
	 */
	onSave(): void {
		if (this.almacenForm.invalid) {
			this.almacenForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar errores
			this.snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', {
				duration: 3000,
				panelClass: ['snackbar-warn']
			});
			return;
		}

		this.isLoading.set(true);
		const request = this.almacenForm.value as IAlmacenCreateUpdateRequest;

		this.almacenService.crearActualizarAlmacen(request).pipe(
			finalize(() => this.isLoading.set(false)), // Desactiva el loading al finalizar
			catchError(error => {
				// El error ya es manejado por el servicio (handleHttpError),
				// pero lo atrapamos aquí para evitar que se propague al subscribe
				return of(null);
			})
		).subscribe(response => {
			if (response && response.bStatus) {
				this.snackBar.open(response.vMensaje, 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.dialogRef.close(true); // Cierra el diálogo y devuelve 'true' (éxito)
			}
			// Si hay error, el servicio ya mostró el SnackBar y este subscribe no recibe nada
		});
	}

	/**
	 * Se ejecuta al hacer clic en Cancelar.
	 */
	onClose(): void {
		this.dialogRef.close(false); // Cierra el diálogo y devuelve 'false' (cancelado)
	}
	// #endregion

	get fc() { return this.almacenForm.controls; }
}
