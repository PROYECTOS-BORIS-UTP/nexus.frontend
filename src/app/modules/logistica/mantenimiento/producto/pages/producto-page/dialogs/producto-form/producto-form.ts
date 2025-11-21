import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IProductoCreateUpdateRequest } from '../../../../interfaces/request/IProductoCreateUpdateRequest.interface';
import { ProductoService } from '../../../../services/producto.service';
import { IProductoResponse } from '../../../../interfaces/response/IProductoResponse.interface';
import { FamiliaService } from '../../../../../familia/services/familia.service';
import { UnidadMedidaService } from '../../../../../unidad-medida/services/unidad-medida.service';

export interface ProductoFormData {
    producto?: IProductoResponse;
}

@Component({
    selector: 'app-producto-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatIconModule
    ],
    templateUrl: './producto-form.html',
    styleUrl: './producto-form.scss'
})
export class ProductoForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private productoService = inject(ProductoService);
    private familiaService = inject(FamiliaService);
    private unidadMedidaService = inject(UnidadMedidaService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ProductoForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    // #region Datos (Selects)
    isLoadingFamilias = signal(false);
    selectFamilias = signal<ISelectItem[]>([]);
    isLoadingUnidades = signal(false);
    selectUnidades = signal<ISelectItem[]>([]);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: ProductoFormData) {
        this.isEdit.set(!!data.producto);

        this.form = this.fb.group({
            iIdProducto: [0],
            vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
            vTitulo: ['', [Validators.required, Validators.maxLength(255)]],
            iIdFamilia: [null, [Validators.required, Validators.min(1)]],
            iIdUnidadMedida: [null, [Validators.required, Validators.min(1)]],
            nStockMinimo: [0, [Validators.min(0)]],
            vCuentaContable: ['', [Validators.maxLength(50)]],
            vRutaImagen: ['', [Validators.maxLength(500)]],
            bActivo: [true, [Validators.required]]
        });
    }

    ngOnInit(): void {
        // Cargar Familias y Unidades de Medida
        this.cargarFamilias();
        this.cargarUnidadesMedida();

        if (this.isEdit() && this.data.producto) {
            const prod = this.data.producto;
            this.form.patchValue({
                iIdProducto: prod.iIdProducto,
                vCodigo: prod.vCodigo,
                vTitulo: prod.vTitulo,
                iIdFamilia: prod.iIdFamilia,
                iIdUnidadMedida: prod.iIdUnidadMedida,
                nStockMinimo: prod.nStockMinimo,
                vCuentaContable: prod.vCuentaContable,
                vRutaImagen: prod.vRutaImagen,
                bActivo: prod.bActivo
            });
        }
    }

    // #region Carga de Datos (Selects)
    cargarFamilias(): void {
        this.isLoadingFamilias.set(true);
        this.familiaService.listarFamilias({ iPageNumber: 1, iPageSize: 1000, bActivo: true }).pipe(
            finalize(() => this.isLoadingFamilias.set(false))
        ).subscribe({
            next: (response) => {
                this.selectFamilias.set(response.aRecords.map(f => ({
                    iIdElemento: f.iIdFamilia,
                    vDescripcion: f.vTitulo
                })));
            },
            error: (err) => {
                console.error('Error cargando familias', err);
            }
        });
    }

    cargarUnidadesMedida(): void {
        this.isLoadingUnidades.set(true);
        this.unidadMedidaService.listarUnidadesMedida({ iPageNumber: 1, iPageSize: 1000, bActivo: true }).pipe(
            finalize(() => this.isLoadingUnidades.set(false))
        ).subscribe({
            next: (response) => {
                this.selectUnidades.set(response.aRecords.map(u => ({
                    iIdElemento: u.iIdUnidadMedida,
                    vDescripcion: u.vDescripcion
                })));
            },
            error: (err) => {
                console.error('Error cargando unidades de medida', err);
            }
        });
    }
    // #endregion

    // #region Acciones del Diálogo
    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
            return;
        }

        this.isLoading.set(true);
        const request = this.form.value as IProductoCreateUpdateRequest;

        this.productoService.crearActualizarProducto(request).pipe(
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