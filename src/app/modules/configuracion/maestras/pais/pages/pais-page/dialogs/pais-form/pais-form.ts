import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { IPaisCreateUpdateRequest } from '../../../../interfaces/request/IPaisCreateUpdateRequest.interface';

export interface PaisFormData {
  pais: IPaisCreateUpdateRequest | null;
}

@Component({
  selector: 'app-pais-form',
  imports: [
    CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDialogModule,
		MatCheckboxModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatProgressSpinnerModule
    
  ],
  templateUrl: './pais-form.html',
  styleUrl: './pais-form.scss'
})
export class PaisForm {


  private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<PaisForm>);

	paisForm: FormGroup;
	tituloDialogo = 'Agregar Pais';
	public paisExistente: IPaisCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: PaisFormData
	) {
		this.paisExistente = data?.pais;

		this.paisForm = this.fb.group({
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vNombre: ['', [Validators.required, Validators.maxLength(50),Validators.minLength(3) ]],
			bActivo: [true, Validators.required]
		});
	}

	ngOnInit(): void {
		if (this.paisExistente) {
			this.tituloDialogo = 'Editar Pais';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.paisExistente,
				// Si iIdElementoPadre viene en paisExistente y lo necesitas en el form, añádelo
			};
			this.paisForm.patchValue(patchData);
		} else {
			this.tituloDialogo = 'Crear Pais';
		}
	}

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.paisForm.invalid) { this.paisForm.markAllAsTouched(); return; }

		const formData = this.paisForm.getRawValue();

		const dataToSend: IPaisCreateUpdateRequest = {
			...formData,
			iIdPais: this.paisExistente?.iIdPais ?? 0
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IPaisCreateUpdateRequest;
				const requiredFields: (keyof IPaisCreateUpdateRequest)[] = [
					'vCodigo', 'vNombre' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}

		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.paisForm.controls; }
}
