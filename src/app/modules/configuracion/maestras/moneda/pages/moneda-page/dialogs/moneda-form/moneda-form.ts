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
import { IMonedaCreateUpdateRequest } from '../../../../interfaces/request/IMonedaCreateUpdateRequest.interface';


export interface MonedaFormData {
  moneda: IMonedaCreateUpdateRequest| null;
}

@Component({
  selector: 'app-moneda-form',
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
  templateUrl: './moneda-form.html',
  styleUrl: './moneda-form.scss'
})
export class MonedaForm {


private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<MonedaForm>);

	monedaForm: FormGroup;
	tituloDialogo = 'Agregar Moneda';
	public monedaExistente: IMonedaCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: MonedaFormData
	) {
		this.monedaExistente= data?.moneda;

		this.monedaForm= this.fb.group({
			vDescripcion: ['', [Validators.required, Validators.maxLength(100)]],
			vSimbolo: ['', [Validators.required, Validators.maxLength(5),Validators.minLength(1) ]],
			vCodigoSunat: [null, [Validators.required, Validators.maxLength(3)]],
			bActivo: [true, Validators.required]
		});
	}

	ngOnInit(): void {
		if (this.monedaExistente) {
			this.tituloDialogo = 'Editar Moneda';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.monedaExistente,
				// Si iIdElementoPadre viene en monedaExistente y lo necesitas en el form, añádelo
			};
			this.monedaForm.patchValue(patchData);
		} else {
			this.tituloDialogo = 'Crear Moneda';
		}
	}

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.monedaForm.invalid) { this.monedaForm.markAllAsTouched(); return; }

		const formData = this.monedaForm.getRawValue();

		const dataToSend: IMonedaCreateUpdateRequest = {
			...formData,
			iIdMoneda: this.monedaExistente?.iIdMoneda ?? 0
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IMonedaCreateUpdateRequest;
				const requiredFields: (keyof IMonedaCreateUpdateRequest)[] = [
					'vDescripcion', 'vSimbolo', 'vCodigoSunat' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}

		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.monedaForm.controls; }


}
