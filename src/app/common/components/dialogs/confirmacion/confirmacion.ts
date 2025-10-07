import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ConfirmacionData {
	titulo: string;
	mensaje: string;
	mostrarCampoObservacion: boolean;
}

@Component({
	selector: 'app-confirmacion',
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule
	],
	templateUrl: './confirmacion.html',
	styleUrl: './confirmacion.scss'
})
export class Confirmacion {
	observacionControl = new FormControl('');

	constructor(
		public dialogRef: MatDialogRef<Confirmacion>,
		@Inject(MAT_DIALOG_DATA) public data: ConfirmacionData
	) { }

	onConfirmar(): void {
		this.dialogRef.close({
			confirmado: true,
			observacion: this.observacionControl.value
		});
	}

	onCancelar(): void {
		this.dialogRef.close({ confirmado: false });
	}
}
