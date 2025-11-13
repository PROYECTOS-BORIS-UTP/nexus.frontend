import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ICompaniaCreateUpdateRequest } from '../../../../interfaces/request/ICompaniaCreateUpdateRequest.interface';

export interface CompaniaFormData {
	compania: ICompaniaCreateUpdateRequest | null;
}

@Component({
	selector: 'app-compania-form',
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
	templateUrl: './compania-form.html',
	styleUrl: './compania-form.scss'
})
export class CompaniaForm {

	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<CompaniaForm>);

	companiaForm: FormGroup;
	tituloDialogo = 'Agregar Compañia';
	public companiaExistente: ICompaniaCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: CompaniaFormData
	) {
		this.companiaExistente = data?.compania;

		this.companiaForm = this.fb.group({
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vRUC: ['', [Validators.required, Validators.maxLength(11),Validators.minLength(11) ]],
			vRazonSocial: [null, [Validators.required, Validators.maxLength(250)]],
			vAbreviatura: ['', [Validators.required, Validators.maxLength(50)]],
			vDireccion: ['', [Validators.required, Validators.maxLength(250)]],
			iIdUbigeo: [null, [Validators.required]],
			bActivo: [true, Validators.required]
		});
	}

	ngOnInit(): void {
		if (this.companiaExistente) {
			this.tituloDialogo = 'Editar Compañia';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.companiaExistente,
				// Si iIdElementoPadre viene en companiaExistente y lo necesitas en el form, añádelo
			};
			this.companiaForm.patchValue(patchData);
		} else {
			this.tituloDialogo = 'Crear Compañia';
		}
	}

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.companiaForm.invalid) { this.companiaForm.markAllAsTouched(); return; }

		const formData = this.companiaForm.getRawValue();

		const dataToSend: ICompaniaCreateUpdateRequest = {
			...formData,
			iIdCompania: this.companiaExistente?.iIdCompania ?? 0
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof ICompaniaCreateUpdateRequest;
				const requiredFields: (keyof ICompaniaCreateUpdateRequest)[] = [
					'vCodigo', 'vAbreviatura', 'vRazonSocial' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}

		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.companiaForm.controls; }
}
