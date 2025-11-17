import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IPersonaCreateUpdateRequest } from '../../../../interfaces/request/IPersonaCreateUpdateRequest.interface';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IElementoSistemaListadoPorCodigoRequest } from '../../../../../elemento-sistema/interfaces/request/IElementoSistemaListadoPorCodigoRequest.interface';
import { ElementoSistemaService } from '../../../../../elemento-sistema/services/elemento-sistema.service';
import { finalize } from 'rxjs';

export interface PersonaFormData {
	persona: IPersonaCreateUpdateRequest | null;
}

@Component({
	selector: 'app-persona-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatCheckboxModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatSelectModule,
		MatIconModule // Opcional
	],
	templateUrl: './persona-form.html',
	styleUrls: ['./persona-form.scss']
})
export class PersonaForm implements OnInit {

	// Inyección de dependencias moderna y clásica
	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<PersonaForm>);
	private elementoSistemaService = inject(ElementoSistemaService);

	// FormGroup para manejar los datos
	personaForm: FormGroup;

	// Título del diálogo (cambia si es edición)
	tituloDialogo = 'Agregar Persona';

	// Datos existentes (para edición)
	public personaExistente: IPersonaCreateUpdateRequest | null = null;

	// --- Datos para Selects (DEBES CARGARLOS DESDE SERVICIOS) ---
	isLoadingTipoPersona= false;
	isLoadingGenero = false;
	isLoadingEstadoCivil = false;

	selectTipoPersona = signal<ISelectItem[]>([]);
	selectGenero = signal<ISelectItem[]>([]);
	selectEstadoCivil = signal<ISelectItem[]>([]);

	// Ubigeos sería una lista más compleja, probablemente cargada dinámicamente
	ubigeos = [{ id: 1, nombre: 'Lima' } /* ... */];
	// --- Fin Datos para Selects ---

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: PersonaFormData
	) {
		this.personaExistente = data.persona;
		this.personaForm = this.fb.group({
			iIdTipoPersona: [null, [Validators.required, Validators.min(1)]],
			vPrimerNombre: ['', [Validators.required, Validators.maxLength(100)]],
			vSegundoNombre: [null, [Validators.maxLength(100)]], // Opcional
			vApellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
			vApellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
			dFechaNacimiento: [null], // Se validará como fecha si es necesario
			iIdUbigeoNacimiento: [null, [Validators.min(1)]], // Opcional
			iIdGenero: [null, [Validators.min(1)]], // Opcional
			iIdEstadoCivil: [null, [Validators.min(1)]], // Opcional
			vCorreo: [null, [Validators.email, Validators.maxLength(150)]], // Opcional pero valida formato email
			vCelular1: [null, [Validators.maxLength(20), Validators.pattern(/^[0-9+()-]*$/)]], // Opcional, valida patrón simple
			vCelular2: [null, [Validators.maxLength(20), Validators.pattern(/^[0-9+()-]*$/)]], // Opcional
			vTelefono: [null, [Validators.maxLength(20), Validators.pattern(/^[0-9+()-]*$/)]], // Opcional
			vDNI: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.pattern(/^[0-9]*$/)]], // Opcional, valida DNI
			vCE: [null, [Validators.maxLength(20)]], // Opcional
			vRUC: [null, [Validators.maxLength(11), Validators.minLength(11), Validators.pattern(/^[0-9]*$/)]], // Opcional, valida RUC
			bActivo: [true, Validators.required] // Por defecto activo
		});
	}

	ngOnInit(): void {
		if (this.personaExistente) {
			this.tituloDialogo = 'Editar Persona';
			// Rellena el formulario con los datos existentes
			// Asegúrate que las propiedades coincidan exactamente
			const datosParaFormulario = {
				...this.personaExistente,
				// Convierte la fecha string a objeto Date si viene del backend y si MatDatepicker lo necesita
				dFechaNacimiento: this.personaExistente.dFechaNacimiento ? new Date(this.personaExistente.dFechaNacimiento + 'T00:00:00') : null
			};
			this.personaForm.patchValue(datosParaFormulario);

			// Podrías necesitar deshabilitar ciertos campos en modo edición si aplica
			// this.personaForm.get('vDNI')?.disable();
			// this.personaForm.get('vRUC')?.disable();
		}
		
		this.cargarTipoPersona();
		this.cargarEstadoCivil();
		this.cargarGenero();
	}

	//#region CARGA SELECTS
	cargarTipoPersona(): void {
		this.isLoadingTipoPersona = true;
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'TIPO_PERSONA' };
		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipoPersona = false))
			.subscribe({
				next: (data) => {
					this.selectTipoPersona.set(
						data.map(comp => ({
							iIdElemento: comp.iIdElemento,
							vDescripcion: comp.vDescripcion
						}))
					);
				},
				error: (err) => {
					console.error('Error al cargar los Tipos de Persona:', err);
					this.selectTipoPersona.set([]);
				}
			});
	}


	cargarEstadoCivil(): void {
		this.isLoadingTipoPersona = true;
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'ESTADO_CIVIL' };
		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipoPersona = false))
			.subscribe({
				next: (data) => {
					this.selectEstadoCivil.set(
						data.map(comp => ({
							iIdElemento: comp.iIdElemento,
							vDescripcion: comp.vDescripcion
						}))
					);
				},
				error: (err) => {
					console.error('Error al cargar los Estados Civiles:', err);
					this.selectEstadoCivil.set([]);
				}
			});
	}

	cargarGenero(): void {
		this.isLoadingGenero = true;
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'GENERO' };
		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingGenero = false))
			.subscribe({
				next: (data) => {
					this.selectGenero.set(
						data.map(comp => ({
							iIdElemento: comp.iIdElemento,
							vDescripcion: comp.vDescripcion
						}))
					);
				},
				error: (err) => {
					console.error('Error al cargar los Géneros:', err);
					this.selectGenero.set([]);
				}
			});
	}
	//end Region

	//#region CERRAR DIALOG
	/*
	 * Cierra el diálogo sin guardar.
	 */
	onCancel(): void {
		this.dialogRef.close(); // No devuelve datos
	}

	//#region GUARDAR PERSONA
	/*
	 * Valida el formulario y lo cierra devolviendo los datos.
	 */
	onSave(): void {
		if (this.personaForm.invalid) {
			this.personaForm.markAllAsTouched(); // Muestra errores si los hay
			console.warn("Formulario inválido:", this.personaForm.errors);
			return;
		}

		// Prepara el objeto a devolver, incluyendo el ID si es edición
		const formData = this.personaForm.getRawValue();

		// Formatea la fecha de vuelta a YYYY-MM-DD si es necesario antes de enviar
		let fechaNacimientoStr: string | null = null;
		if (formData.dFechaNacimiento instanceof Date && !isNaN(formData.dFechaNacimiento)) {
			const date = formData.dFechaNacimiento;
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			fechaNacimientoStr = `${year}-${month}-${day}`;
		}

		// Construye el objeto final asegurando tipos y nulidad
		const dataToSend: IPersonaCreateUpdateRequest = {
			iIdPersona: this.personaExistente?.iIdPersona ?? 0,
			iIdTipoPersona: formData.iIdTipoPersona,
			vPrimerNombre: formData.vPrimerNombre,
			vSegundoNombre: formData.vSegundoNombre || null,
			vApellidoPaterno: formData.vApellidoPaterno,
			vApellidoMaterno: formData.vApellidoMaterno,
			dFechaNacimiento: fechaNacimientoStr,
			iIdUbigeoNacimiento: formData.iIdUbigeoNacimiento || null,
			iIdGenero: formData.iIdGenero || null,
			iIdEstadoCivil: formData.iIdEstadoCivil || null,
			vCorreo: formData.vCorreo || null,
			vCelular1: formData.vCelular1 || null,
			vCelular2: formData.vCelular2 || null,
			vTelefono: formData.vTelefono || null,
			vDNI: formData.vDNI || null,
			vCE: formData.vCE || null,
			vRUC: formData.vRUC || null,
			bActivo: formData.bActivo 
		};

		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IPersonaCreateUpdateRequest;
				// Específicamente convierte strings vacíos a null, excepto los requeridos que no deberían estar vacíos
				if (dataToSend[typedKey] === '') {
					// Lista de campos requeridos que NO deben ser null si están vacíos (ya validados)
					const requiredStringFields: (keyof IPersonaCreateUpdateRequest)[] = [
						'vPrimerNombre', 'vApellidoPaterno', 'vApellidoMaterno'
					];
					if (!requiredStringFields.includes(typedKey)) {
						// Asignación segura con tipo explícito
						(dataToSend as any)[typedKey] = null;
					}
				}
			}
		}
		this.dialogRef.close(dataToSend);
	}

	// --- Helpers ---
	get fc() {
		return this.personaForm.controls;
	}
}