import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { IUsuarioCreateUpdateRequest } from '../../../../interfaces/request/IUsuarioCreateUpdateRequest.interface';


export interface UsuarioFormData {
	usuario: IUsuarioCreateUpdateRequest | null;
}
 
@Component({
	selector: 'app-usuario-form',
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
	templateUrl: './usuario-form.html',
	styleUrl: './usuario-form.scss'
})
export class UsuarioForm {
private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<UsuarioForm>);

	usuarioForm: FormGroup;
	tituloDialogo = 'Agregar Usuario';
	public usuarioExistente: IUsuarioCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: UsuarioFormData
	) {
		this.usuarioExistente = data?.usuario;

		this.usuarioForm = this.fb.group({

			vUsuario: ['', [Validators.required, Validators.maxLength(50)]],
			bActivo: [true, Validators.required],
			iIdTipoUsuario: ['', [Validators.required ]],
			iIdPersona: [[Validators.required, Validators.maxLength(50)]],
			iIdTipoPersona: ['', [Validators.required, Validators.maxLength(50)]],
			
			
		});
	}

	ngOnInit(): void {
		if (this.usuarioExistente) {
			this.tituloDialogo = 'Editar Usuario';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.usuarioExistente,
				// Si iIdElementoPadre viene en usuarioExistente y lo necesitas en el form, añádelo
			};
			this.usuarioForm.patchValue(patchData);
		} else {
			this.tituloDialogo = 'Crear Usuario';
		}
	}

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.usuarioForm.invalid) { this.usuarioForm.markAllAsTouched(); return; }

		const formData = this.usuarioForm.getRawValue();

		const dataToSend: IUsuarioCreateUpdateRequest = {
			...formData,
			iIdusuario: this.usuarioExistente?.iIdUsuario ?? 0
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IUsuarioCreateUpdateRequest;
				const requiredFields: (keyof IUsuarioCreateUpdateRequest)[] = [
					'vUsuario', 'iIdTipoUsuario', 'iIdPersona','iIdTipoPersona' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}

		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.usuarioForm.controls; }
}
