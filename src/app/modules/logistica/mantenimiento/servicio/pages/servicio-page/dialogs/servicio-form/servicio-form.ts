import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { IServicioCreateUpdateRequest } from '../../../../interfaces/request/IServicioCreateUpdateRequest.interface';
import { ServicioService } from '../../../../services/servicio.service';
import { IServicioResponse } from '../../../../interfaces/response/IServicioResponse.interface';

export interface ServicioFormData {
    servicio?: IServicioResponse;
}

@Component({
    selector: 'app-servicio-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatIconModule
    ],
    templateUrl: './servicio-form.html',
    styleUrl: './servicio-form.scss'
})
export class ServicioForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private servicioService = inject(ServicioService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ServicioForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: ServicioFormData) {
        this.isEdit.set(!!data.servicio);

        this.form = this.fb.group({
            iIdServicio: [0],
            vTitulo: ['', [Validators.required, Validators.maxLength(255)]],
            vDescripcion: ['', [Validators.maxLength(500)]],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        if (this.isEdit() && this.data.servicio) {
            const serv = this.data.servicio;
            this.form.patchValue({
                iIdServicio: serv.iIdServicio,
                vTitulo: serv.vTitulo,
                vDescripcion: serv.vDescripcion,
                bActivo: serv.bActivo
            });
        }
    }

    // #region Acciones del Diálogo
    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
            return;
        }

        this.isLoading.set(true);
        const request = this.form.value as IServicioCreateUpdateRequest;

        this.servicioService.crearActualizarServicio(request).pipe(
            finalize(() => this.isLoading.set(false)),
            catchError(error => of(null))
        ).subscribe(response => {
            if (response && response.bStatus) {
                this.snackBar.open(response.vMensaje, 'Cerrar', {
                    duration: 3000,
                    panelClass: ['snackbar-success']
                });
                this.dialogRef.close(true);
            }
        });
    }

    onClose(): void {
        this.dialogRef.close(false);
    }
    // #endregion
}
