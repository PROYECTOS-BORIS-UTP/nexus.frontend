import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, finalize, of } from 'rxjs';
import { IProveedorContactoCreateUpdateRequest } from '../../interfaces/request/IProveedorContactoCreateUpdateRequest.interface';
import { IProveedorContactoResponse } from '../../interfaces/response/IProveedorContactoResponse.interface';
import { ProveedorContactoService } from '../../services/proveedor-contacto.service';

export interface ProveedorContactoFormData {
	idProveedor: number;
	contacto?: IProveedorContactoResponse;
}

@Component({
	selector: 'app-proveedor-contacto-form',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatCheckboxModule,
		MatSnackBarModule,
		MatProgressBarModule
	],
	templateUrl: './proveedor-contacto-form.html',
	styleUrl: './proveedor-contacto-form.scss',
	encapsulation: ViewEncapsulation.None
})
export class ProveedorContactoFormComponent implements OnInit {
	// #region Inyección de Dependencias
	private fb = inject(FormBuilder);
	private contactoService = inject(ProveedorContactoService);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<ProveedorContactoFormComponent>);
	// #endregion

	// #region Variables de Estado
	form: FormGroup;
	isLoading = signal(false);
	isEditMode = false;
	titulo = 'Nuevo Contacto';
	// #endregion

	constructor(@Inject(MAT_DIALOG_DATA) public data: ProveedorContactoFormData) {
		this.isEditMode = !!data.contacto;
		this.titulo = this.isEditMode ? 'Editar Contacto' : 'Nuevo Contacto';

		this.form = this.fb.group({
			vNombreCompleto: [data.contacto?.vNombreCompleto || '', [Validators.required, Validators.maxLength(255)]],
			vCargo: [data.contacto?.vCargo || '', [Validators.maxLength(100)]],
			vCelular: [data.contacto?.vCelular || '', [Validators.maxLength(20)]],
			vCorreo: [data.contacto?.vCorreo || '', [Validators.email, Validators.maxLength(100)]],
			bActivo: [data.contacto?.bActivo ?? true]
		});
	}

	ngOnInit(): void {
	}

	onSave(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		const formValue = this.form.value;

		const request: IProveedorContactoCreateUpdateRequest = {
			iIdContacto: this.data.contacto?.iIdContacto || 0,
			iIdProveedor: this.data.idProveedor,
			vNombreCompleto: formValue.vNombreCompleto,
			vCargo: formValue.vCargo,
			vCelular: formValue.vCelular,
			vCorreo: formValue.vCorreo,
			bActivo: formValue.bActivo
		};

		this.contactoService.crearActualizarContacto(request).pipe(
			finalize(() => this.isLoading.set(false)),
			catchError(error => {
				this.snackBar.open(error.message || 'Error al guardar el contacto', 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
				return of(null);
			})
		).subscribe(response => {
			if (response) {
				this.snackBar.open(response.vMensaje, 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.dialogRef.close(true);
			}
		});
	}

	onCancel(): void {
		this.dialogRef.close(false);
	}
}
