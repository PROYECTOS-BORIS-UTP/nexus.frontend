import { Component, Inject, inject } from '@angular/core';
import { IPerfilCreateUpdateRequest } from '../../../../interfaces/request/IPerfilCreateUpdateRequest.interface';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';



export interface PerfilFormData {
  perfil: IPerfilCreateUpdateRequest | null;
}

@Component({
  selector: 'app-perfil-form',
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
  templateUrl: './perfil-form.html',
  styleUrl: './perfil-form.scss'
})



export class PerfilForm {


  private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<PerfilForm>);

	perfilForm: FormGroup;
	tituloDialogo = 'Agregar Perfil';
	public perfilExistente: IPerfilCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: PerfilFormData
	) {
		this.perfilExistente = data?.perfil;

		this.perfilForm = this.fb.group({
			vPerfil: ['', [Validators.required, Validators.maxLength(50)]],
			vDescripcion: ['', [Validators.required, Validators.maxLength(50),Validators.minLength(10) ]],
			bActivo: [true, Validators.required]
		});
	}

	ngOnInit(): void {
		if (this.perfilExistente) {
			this.tituloDialogo = 'Editar Perfil';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.perfilExistente,
			};
			this.perfilForm.patchValue(patchData);
		} else {
			this.tituloDialogo = 'Crear Perfil';
		}
	}

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.perfilForm.invalid) { this.perfilForm.markAllAsTouched(); return; }

		const formData = this.perfilForm.getRawValue();

		const dataToSend: IPerfilCreateUpdateRequest = {
			...formData,
			iIdperfil: this.perfilExistente?.iIdPerfil ?? 0
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IPerfilCreateUpdateRequest;
				const requiredFields: (keyof IPerfilCreateUpdateRequest)[] = [
					'vPerfil', 'vDescripcion' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}

		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.perfilForm.controls; }
}
