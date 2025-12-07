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
import { IClienteContactoCreateUpdateRequest } from '../../../../interfaces/request/IClienteContactoCreateUpdateRequest.interface';
import { IClienteContactoResponse } from '../../../../interfaces/response/IClienteContactoResponse.interface';
import { ClienteContactoService } from '../../../../services/cliente-contacto.service';

export interface ClienteContactoFormData {
    iIdCliente: number;
    contacto?: IClienteContactoResponse;
}

@Component({
    selector: 'app-cliente-contacto-form',
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
    templateUrl: './cliente-contacto-form.html',
    styleUrl: './cliente-contacto-form.scss',
    encapsulation: ViewEncapsulation.None
})
export class ClienteContactoForm implements OnInit {
    // #region Inyección de Dependencias
    private fb = inject(FormBuilder);
    private contactoService = inject(ClienteContactoService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ClienteContactoForm>);
    // #endregion

    // #region Variables de Estado
    form: FormGroup;
    isLoading = signal(false);
    isEditMode = false;
    titulo = 'Nuevo Contacto';
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: ClienteContactoFormData) {
        this.isEditMode = !!data.contacto;
        this.titulo = this.isEditMode ? 'Editar Contacto' : 'Nuevo Contacto';

        this.form = this.fb.group({
            vNombreCompleto: [data.contacto?.vNombreCompleto || '', [Validators.required, Validators.maxLength(200)]],
            vCargo: [data.contacto?.vCargo || '', [Validators.maxLength(100)]],
            vCelular: [data.contacto?.vCelular || '', [Validators.maxLength(20)]],
            vCorreo: [data.contacto?.vCorreo || '', [Validators.required, Validators.email, Validators.maxLength(150)]],
            bEsPrincipal: [data.contacto?.bEsPrincipal ?? false],
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

        const request: IClienteContactoCreateUpdateRequest = {
            iIdClienteContacto: this.data.contacto?.iIdClienteContacto || 0,
            iIdCliente: this.data.iIdCliente,
            vNombreCompleto: formValue.vNombreCompleto,
            vCargo: formValue.vCargo,
            vCelular: formValue.vCelular,
            vCorreo: formValue.vCorreo,
            bEsPrincipal: formValue.bEsPrincipal,
            bActivo: formValue.bActivo
        };

        this.contactoService.CrearActualizarClienteContacto(request).pipe(
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
