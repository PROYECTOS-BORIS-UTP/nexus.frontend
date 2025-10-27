import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IUsuarioResponse } from '../../../../interfaces/response/IUsuarioResponse.interface';


@Component({
	selector: 'app-usuario-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule
	],
	templateUrl: './usuario-form.html',
	styleUrl: './usuario-form.scss'
})
export class UsuarioForm {
	usuarioForm: FormGroup;
	isEditMode: boolean;
	titulo: string;

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<UsuarioForm>,
		// Inyectamos los datos que vienen desde el componente padre
		@Inject(MAT_DIALOG_DATA) public data: { usuario?: IUsuarioResponse }
	) {
		this.isEditMode = !!this.data.usuario;
		this.titulo = this.isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario';

		this.usuarioForm = this.fb.group({
			vNombreCompleto: ['', Validators.required],
			vEmail: ['', [Validators.required, Validators.email]],
			// Aquí puedes agregar más campos como perfiles, etc.
		});
	}

	ngOnInit(): void {
		if (this.isEditMode && this.data.usuario) {
			// Si es modo edición, llenamos el formulario con los datos del usuario
			this.usuarioForm.patchValue(this.data.usuario);
		}
	}

	onGuardar(): void {
		if (this.usuarioForm.valid) {
			// Cerramos el diálogo y devolvemos los valores del formulario
			this.dialogRef.close(this.usuarioForm.value);
		}
	}

	onCancelar(): void {
		this.dialogRef.close();
	}
}
