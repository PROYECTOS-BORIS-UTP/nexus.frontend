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
import { IProveedorCreateUpdateRequest } from '../../../../interfaces/request/IProveedorCreateUpdateRequest.interface';
import { ProveedorService } from '../../../../services/proveedor.service';
import { IProveedorResponse } from '../../../../interfaces/response/IProveedorResponse.interface';

export interface ProveedorFormData {
    proveedor?: IProveedorResponse;
}

@Component({
    selector: 'app-proveedor-form',
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
    templateUrl: './proveedor-form.html',
    styleUrl: './proveedor-form.scss'
})
export class ProveedorForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private proveedorService = inject(ProveedorService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ProveedorForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: ProveedorFormData) {
        this.isEdit.set(!!data.proveedor);

        this.form = this.fb.group({
            iIdProveedor: [0],
            vRUC: ['', [Validators.required, Validators.maxLength(11)]],
            vRazonSocial: ['', [Validators.required, Validators.maxLength(255)]],
            vDireccion: ['', [Validators.maxLength(500)]],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        if (this.isEdit() && this.data.proveedor) {
            const prov = this.data.proveedor;
            this.form.patchValue({
                iIdProveedor: prov.iIdProveedor,
                vRUC: prov.vRUC,
                vRazonSocial: prov.vRazonSocial,
                vDireccion: prov.vDireccion,
                bActivo: prov.bActivo
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
        const request = this.form.value as IProveedorCreateUpdateRequest;

        this.proveedorService.crearActualizarProveedor(request).pipe(
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
