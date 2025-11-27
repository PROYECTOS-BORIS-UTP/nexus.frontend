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
import { IFamiliaCreateUpdateRequest } from '../../../../interfaces/request/IFamiliaCreateUpdateRequest.interface';
import { FamiliaService } from '../../../../services/familia.service';
import { IFamiliaResponse } from '../../../../interfaces/response/IFamiliaResponse.interface';

export interface FamiliaFormData {
    familia?: IFamiliaResponse;
}

@Component({
    selector: 'app-familia-form',
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
    templateUrl: './familia-form.html',
    styleUrl: './familia-form.scss'
})
export class FamiliaForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private familiaService = inject(FamiliaService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<FamiliaForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: FamiliaFormData) {
        this.isEdit.set(!!data.familia);

        this.form = this.fb.group({
            iIdFamilia: [0],
            vTitulo: ['', [Validators.required, Validators.maxLength(255)]],
            vSigla: ['', [Validators.required, Validators.maxLength(50)]],
            vCuentaContable: ['', [Validators.maxLength(50)]],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        if (this.isEdit() && this.data.familia) {
            const familia = this.data.familia;
            this.form.patchValue({
                iIdFamilia: familia.iIdFamilia,
                vTitulo: familia.vTitulo,
                vSigla: familia.vSigla,
                vCuentaContable: familia.vCuentaContable,
                bActivo: familia.bActivo
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
        const request = this.form.value as IFamiliaCreateUpdateRequest;

        this.familiaService.crearActualizarFamilia(request).pipe(
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
