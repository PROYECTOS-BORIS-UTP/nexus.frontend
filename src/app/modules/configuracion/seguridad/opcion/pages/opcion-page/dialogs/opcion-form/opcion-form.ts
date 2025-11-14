import { Component, inject } from '@angular/core';
import { IOpcionListadoResponse } from '../../../../interfaces/response/IOpcionListadoResponse.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IOpcionCreateUpdateRequest } from '../../../../interfaces/request/IOpcionCreateUpdateRequest.interface';
import { OpcionService } from '../../../../services/opcion.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

export interface IOpcionFormData {
	opcion?: IOpcionListadoResponse;
	iIdOpcionP: number | null;
}

@Component({
	selector: 'app-opcion-form',
	imports: [
		CommonModule
		, ReactiveFormsModule
		, MatDialogModule
		, MatFormFieldModule
		, MatInputModule
		, MatButtonModule
		, MatSelectModule
		, MatCheckboxModule
		, MatIconModule
	],
	templateUrl: './opcion-form.html',
	styleUrl: './opcion-form.scss'
})
export class OpcionForm {
	private fb = inject(FormBuilder);
	private opcionService = inject(OpcionService);
	public dialogRef = inject(MatDialogRef<OpcionForm>);
	public data: IOpcionFormData = inject(MAT_DIALOG_DATA);

	public opcionForm: FormGroup;
	public isEditMode = false;
	public formTitle = 'Nueva Opción';

	// Simulación de tipos de opción (deberías traerlos de un servicio)
	public tiposOpcion = [
		{ id: 1, nombre: 'Módulo' },
		{ id: 2, nombre: 'Grupo' },
		{ id: 3, nombre: 'Item (Página)' },
	];

	constructor() {
		this.opcionForm = this.fb.group({
			iIdOpcion: [0],
			iIdOpcionP: [null],
			vOpcion: ['', [Validators.required, Validators.maxLength(100)]],
			iIdTipoOpcion: [null, [Validators.required]],
			vCodigo: ['', [Validators.maxLength(100)]],
			vRuta: ['', [Validators.maxLength(255)]],
			vIcono: ['', [Validators.maxLength(100)]],
			vDescripcion: ['', [Validators.maxLength(255)]],
			vTitulo: ['', [Validators.maxLength(50)]],
			vTooltip: ['', [Validators.maxLength(100)]],
			vColor: ['', [Validators.maxLength(50)]],
			bActivo: [true, [Validators.required]]
		});
	}

	ngOnInit(): void {
		if (this.data.opcion) {
			// Modo Edición
			this.isEditMode = true;
			this.formTitle = `Editar Opción: ${this.data.opcion.vOpcion}`;
			this.opcionForm.patchValue(this.data.opcion);
		} else {
			// Modo Creación
			this.isEditMode = false;
			this.formTitle = 'Nueva Opción';
			this.opcionForm.patchValue({
				iIdOpcionP: this.data.iIdOpcionP,
				bActivo: true,
				iIdOpcion: 0
			});
		}
	}

	guardarOpcion(): void {
		if (this.opcionForm.invalid) {
			this.opcionForm.markAllAsTouched();
			return;
		}

		const request: IOpcionCreateUpdateRequest = this.opcionForm.value;
		this.opcionService.crearActualizarOpcion(request).subscribe({
			next: (response) => {
				this.dialogRef.close(true);
			},
			error: (err) => {
				console.error('Error al guardar', err);
			}
		});
	}

	cancelar(): void {
		this.dialogRef.close(false);
	}
}
