import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IElementoSistemaCreateUpdateRequest } from '../../../../interfaces/request/IElementoSistemaCreateUpdateRequest.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Interfaz para los datos inyectados
export interface ElementoSistemaFormData {
	elemento: IElementoSistemaCreateUpdateRequest | null;
}

@Component({
	selector: 'app-elemento-sistema-form',
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDialogModule,
		MatCheckboxModule,
		ReactiveFormsModule,
		MatButtonModule
	],
	templateUrl: './elemento-sistema-form.html',
	styleUrls: ['./elemento-sistema-form.scss']
})
export class ElementoSistemaForm implements OnInit {

	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<ElementoSistemaForm>);

	elementoSistemaForm: FormGroup;
	tituloDialogo = 'Agregar Elemento del Sistema';
	public elementoExistente: IElementoSistemaCreateUpdateRequest | null = null;

	// --- Placeholders para Selects (DEBES CARGARLOS DESDE SERVICIOS) ---
	elementosPadre: any[] = []; // Cargar lista de elementos para seleccionar padre
	tiposElemento: any[] = []; // Cargar tipos
	companias: any[] = []; // Cargar compañías
	paises: any[] = []; // Cargar países
	// --- Fin Placeholders ---

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ElementoSistemaFormData
	) {
		this.elementoExistente = data?.elemento;

		this.elementoSistemaForm = this.fb.group({
			iIdElementoPadre: [null, [Validators.min(1)]], // Opcional
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vAbreviatura: ['', [Validators.required, Validators.maxLength(50)]],
			vDescripcion: ['', [Validators.required, Validators.maxLength(250)]],
			iSubGrupo: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Asegura numérico
			bActivo: [true, Validators.required],
			iIdTipoElemento: [null, [Validators.required, Validators.min(1)]],
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			iIdPais: [null, [Validators.required, Validators.min(1)]]
		});
	}

	ngOnInit(): void {
		if (this.elementoExistente) {
			this.tituloDialogo = 'Editar Elemento del Sistema';
			this.elementoSistemaForm.patchValue(this.elementoExistente);
			// Podrías deshabilitar 'vCodigo' en modo edición si no debe cambiarse
			// this.elementoSistemaForm.get('vCodigo')?.disable();
		}
		// Cargar datos para los selects aquí (elementosPadre, tiposElemento, companias, paises)
		// this.cargarDatosSelects();
	}

	/*
	cargarDatosSelects(): void {
	  // Ejemplo: this.otroServicio.getTiposElemento().subscribe(data => this.tiposElemento = data);
	  // ... Cargar los demás
	}
	*/

	onCancel(): void {
		this.dialogRef.close();
	}

	onSave(): void {
		if (this.elementoSistemaForm.invalid) {
			this.elementoSistemaForm.markAllAsTouched();
			return;
		}

		const formData = this.elementoSistemaForm.getRawValue();

		// Asegura que iSubGrupo sea número
		const subGrupoNum = Number(formData.iSubGrupo);

		const dataToSend: IElementoSistemaCreateUpdateRequest = {
			...formData,
			iIdElemento: this.elementoExistente?.iIdElemento ?? 0,
			iIdElementoPadre: formData.iIdElementoPadre || null, // Asegura null si no se selecciona
			iSubGrupo: isNaN(subGrupoNum) ? 0 : subGrupoNum, // Maneja posible NaN
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IElementoSistemaCreateUpdateRequest;
				const requiredFields: (keyof IElementoSistemaCreateUpdateRequest)[] = [
					'vCodigo', 'vAbreviatura', 'vDescripcion' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}


		this.dialogRef.close(dataToSend);
	}

	get fc() {
		return this.elementoSistemaForm.controls;
	}
}