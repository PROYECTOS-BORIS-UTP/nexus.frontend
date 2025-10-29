import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necesario para MatDatepicker
import { MatSelectModule } from '@angular/material/select'; // Para Tipo Persona, Género, Estado Civil, Ubigeo
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Opcional, para iconos
import { IPersonaCreateUpdateRequest } from '../../../../interfaces/request/IPersonaCreateUpdateRequest.interface';


// Interfaz para los datos inyectados al diálogo


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

	// FormGroup para manejar los datos
	personaForm: FormGroup;

	// Título del diálogo (cambia si es edición)
	tituloDialogo = 'Agregar Persona';

	// Datos existentes (para edición)
	public personaExistente: IPersonaCreateUpdateRequest | null = null;

	// --- Datos para Selects (DEBES CARGARLOS DESDE SERVICIOS) ---
	// Estos son ejemplos, necesitas obtener los datos reales
	tiposPersona = [{ id: 1, nombre: 'Natural' }, { id: 2, nombre: 'Jurídica' }];
	generos = [{ id: 1, nombre: 'Masculino' }, { id: 2, nombre: 'Femenino' }];
	estadosCiviles = [{ id: 1, nombre: 'Soltero/a' }, { id: 2, nombre: 'Casado/a' } /* ... */];
	// Ubigeos sería una lista más compleja, probablemente cargada dinámicamente
	ubigeos = [{ id: 150101, nombre: 'Lima' } /* ... */];
	// --- Fin Datos para Selects ---

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: IPersonaCreateUpdateRequest
	) {
		this.personaExistente = data; // Guarda los datos inyectados

		// Define la estructura del formulario con validaciones iniciales
		this.personaForm = this.fb.group({
			// iIdPersona se maneja internamente, no necesita un control directo si solo se envía
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
		// Aquí deberías llamar a servicios para cargar los datos de los selects (TipoPersona, Genero, etc.)
	}

	/**
	 * Cierra el diálogo sin guardar.
	 */
	onCancel(): void {
		this.dialogRef.close(); // No devuelve datos
	}

	/**
	 * Valida el formulario y lo cierra devolviendo los datos.
	 */
	onSave(): void {
		if (this.personaForm.invalid) {
			this.personaForm.markAllAsTouched(); // Muestra errores si los hay
			console.warn("Formulario inválido:", this.personaForm.errors);
			// Opcional: Mostrar un snackbar o mensaje al usuario
			// inject(MatSnackBar).open('Por favor, revise los campos marcados.', 'Cerrar', { duration: 3000 });
			return;
		}

		// Prepara el objeto a devolver, incluyendo el ID si es edición
		const formData = this.personaForm.getRawValue(); // Usa getRawValue para incluir campos deshabilitados si los hubiera

		// Formatea la fecha de vuelta a YYYY-MM-DD si es necesario antes de enviar
		let fechaNacimientoStr: string | null = null;
		if (formData.dFechaNacimiento instanceof Date && !isNaN(formData.dFechaNacimiento)) {
			// Asegura que la fecha se formatee correctamente a YYYY-MM-DD en la zona horaria local
			const date = formData.dFechaNacimiento;
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			fechaNacimientoStr = `${year}-${month}-${day}`;
		}

		// Construye el objeto final asegurando tipos y nulidad
		const dataToSend: IPersonaCreateUpdateRequest = {
			iIdPersona: this.personaExistente?.iIdPersona ?? 0,
			iIdTipoPersona: formData.iIdTipoPersona, // Requerido
			vPrimerNombre: formData.vPrimerNombre, // Requerido
			vSegundoNombre: formData.vSegundoNombre || null, // Asegura null si está vacío
			vApellidoPaterno: formData.vApellidoPaterno, // Requerido
			vApellidoMaterno: formData.vApellidoMaterno, // Requerido
			dFechaNacimiento: fechaNacimientoStr, // Fecha formateada o null
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
			bActivo: formData.bActivo // Requerido (boolean)
		};

		// Opcional: Limpieza final si el backend NO acepta strings vacíos donde espera null
		// (Este bucle es más seguro que el anterior)
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


		console.log("Datos a enviar:", dataToSend);
		this.dialogRef.close(dataToSend); // Devuelve los datos del formulario limpios
	}

	// --- Helpers para obtener controles (opcional, para templates más limpios) ---
	get fc() {
		return this.personaForm.controls;
	}
}