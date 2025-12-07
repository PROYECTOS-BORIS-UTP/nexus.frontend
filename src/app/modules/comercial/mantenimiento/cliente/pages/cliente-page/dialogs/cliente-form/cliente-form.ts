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
import { IClienteCreateUpdateRequest } from '../../../../interfaces/request/IClienteCreateUpdateRequest.interface';
import { ClienteService } from '../../../../services/cliente.service';
import { IClienteResponse } from '../../../../interfaces/response/IClienteResponse.interface';
import { MatSelectModule } from '@angular/material/select';

export interface ClienteFormData {
    cliente?: IClienteResponse;
}

@Component({
    selector: 'app-cliente-form',
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
        MatIconModule,
        MatSelectModule
    ],
    templateUrl: './cliente-form.html',
    styleUrl: './cliente-form.scss'
})
export class ClienteForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private clienteService = inject(ClienteService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ClienteForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: ClienteFormData) {
        this.isEdit.set(!!data.cliente);

        this.form = this.fb.group({
            iIdCliente: [0],
            iIdCompania: [1, [Validators.required]], // Default 1 for now
            iIdTipoDocumento: [1, [Validators.required]], // Default 1 (RUC)
            vNumeroDocumento: ['', [Validators.required, Validators.maxLength(20)]],
            vRazonSocial: ['', [Validators.required, Validators.maxLength(255)]],
            vNombreComercial: ['', [Validators.maxLength(255)]],
            vDireccionFiscal: ['', [Validators.maxLength(500)]],
            vDireccionEntrega: ['', [Validators.maxLength(500)]],
            vTelefono: ['', [Validators.maxLength(50)]],
            vCorreoFacturacion: ['', [Validators.email, Validators.maxLength(150)]],
            iIdVendedor: [null],
            iIdCondicionPago: [null],
            nLineaCredito: [0],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        if (this.isEdit() && this.data.cliente) {
            const client = this.data.cliente;
            this.form.patchValue({
                iIdCliente: client.iIdCliente,
                iIdCompania: client.iIdCompania,
                iIdTipoDocumento: client.iIdTipoDocumento,
                vNumeroDocumento: client.vNumeroDocumento,
                vRazonSocial: client.vRazonSocial,
                vNombreComercial: client.vNombreComercial,
                vDireccionFiscal: client.vDireccionFiscal,
                vTelefono: client.vTelefono,
                vCorreoFacturacion: client.vCorreoFacturacion,
                iIdVendedor: client.iIdVendedor,
                iIdCondicionPago: client.iIdCondicionPago,
                nLineaCredito: client.nLineaCredito,
                bActivo: client.bActivo
            });
            // Note: vDireccionEntrega not in IClienteResponse? It was in Request but maybe not Response.
            // Checked IClienteResponse: doesn't have vDireccionEntrega.
            // So we can't pre-fill it if it's not in response.
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
        const request = this.form.value as IClienteCreateUpdateRequest;

        this.clienteService.CrearActualizarCliente(request).pipe(
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
