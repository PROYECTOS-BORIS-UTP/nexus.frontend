import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IPersonaResponse } from '../../../../interfaces/response/IPersonaResponse.interface';

@Component({
  selector: 'app-persona-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './persona-form.html',
  styleUrl: './persona-form.scss',
})
export class PersonaForm {
  PersonaForm: FormGroup;
  isEditMode: boolean;
  titulo: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PersonaForm>,
    // Inyectamos los datos que vienen desde el componente padre
    @Inject(MAT_DIALOG_DATA) public data: { persona?: IPersonaResponse }
  ) {
    this.isEditMode = !!this.data.persona;
    this.titulo = this.isEditMode ? 'Editar Persona' : 'Agregar Nueva Persona';

    this.PersonaForm = this.fb.group({
      vNombreCompleto: ['', Validators.required],
      vDNI: ['', [Validators.required]],
      // Aquí puedes agregar más campos como perfiles, etc.
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.persona) {
      // Si es modo edición, llenamos el formulario con los datos del usuario
      this.PersonaForm.patchValue(this.data.persona);
    }
  }

  onGuardar(): void {
    if (this.PersonaForm.valid) {
      // Cerramos el diálogo y devolvemos los valores del formulario
      this.dialogRef.close(this.PersonaForm.value);
    }
  }

  onCancelar(): void {
    this.dialogRef.close();
  }
}
