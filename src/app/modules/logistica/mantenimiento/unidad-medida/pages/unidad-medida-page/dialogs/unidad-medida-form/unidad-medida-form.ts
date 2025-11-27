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
import { IUnidadMedidaCreateUpdateRequest } from '../../../../interfaces/request/IUnidadMedidaCreateUpdateRequest.interface';
import { UnidadMedidaService } from '../../../../services/unidad-medida.service';
import { IUnidadMedidaResponse } from '../../../../interfaces/response/IUnidadMedidaResponse.interface';

export interface UnidadMedidaFormData {
    unidadMedida?: IUnidadMedidaResponse;
}

@Component({
    selector: 'app-unidad-medida-form',
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
    templateUrl: './unidad-medida-form.html',
    styleUrl: './unidad-medida-form.scss'
})
export class UnidadMedidaForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private unidadMedidaService = inject(UnidadMedidaService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<UnidadMedidaForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: UnidadMedidaFormData) {
        this.isEdit.set(!!data.unidadMedida);

        this.form = this.fb.group({
            iIdUnidadMedida: [0],
            vDescripcion: ['', [Validators.required, Validators.maxLength(100)]],
            vAbreviatura: ['', [Validators.required, Validators.maxLength(20)]],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        if (this.isEdit() && this.data.unidadMedida) {
            const unidad = this.data.unidadMedida;
            this.form.patchValue({
                iIdUnidadMedida: unidad.iIdUnidadMedida,
                vDescripcion: unidad.vDescripcion,
                vAbreviatura: unidad.vAbreviatura,
                bActivo: unidad.bActivo
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
        const request = this.form.value as IUnidadMedidaCreateUpdateRequest;

        this.unidadMedidaService.crearActualizarUnidadMedida(request).pipe(
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
