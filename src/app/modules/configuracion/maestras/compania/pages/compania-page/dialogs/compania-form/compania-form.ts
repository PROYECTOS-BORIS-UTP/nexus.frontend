import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Compania } from '../../compania-page';
@Component({
  selector: 'app-compania-form',
  imports: [
    CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule
  ],
  templateUrl: './compania-form.html',
  styleUrl: './compania-form.scss'
})
export class CompaniaForm {
CompaniaForm: FormGroup;
isEditMode: boolean;
	titulo: string;

constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CompaniaForm>,
    // Inyectamos los datos que vienen desde el componente padre
    @Inject(MAT_DIALOG_DATA) public data: { compania?: Compania }
  ) {
    this.isEditMode = !!this.data.compania;
    this.titulo = this.isEditMode ? 'Editar Compania' : 'Agregar Nueva Compania';

    this.CompaniaForm = this.fb.group({
      vCodigo: ['', Validators.required],
      vRUC: ['', [Validators.required]],
      // Aquí puedes agregar más campos como perfiles, etc.
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.compania) {
      // Si es modo edición, llenamos el formulario con los datos del usuario
      this.CompaniaForm.patchValue(this.data.compania);
    }
  }

  onGuardar(): void {
    if (this.CompaniaForm.valid) {
      // Cerramos el diálogo y devolvemos los valores del formulario
      this.dialogRef.close(this.CompaniaForm.value);
    }
  }

  onCancelar(): void {
    this.dialogRef.close();
  }



}
