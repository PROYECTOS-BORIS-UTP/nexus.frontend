import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IStockProductoCreateUpdateRequest } from '../../../../interfaces/request/IStockProductoCreateUpdateRequest.interface';
import { StockProductoService } from '../../../../services/stock-producto.service';
import { IStockProductoResponse } from '../../../../interfaces/response/IStockProductoResponse.interface';
import { AlmacenService } from '../../../../../../../almacen/mantenimiento/almacen/services/almacen.service';
import { ProductoService } from '../../../../../../../logistica/mantenimiento/producto/services/producto.service';

export interface StockProductoFormData {
    stock?: IStockProductoResponse;
}

@Component({
    selector: 'app-stock-producto-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatIconModule
    ],
    templateUrl: './stock-producto-form.html',
    styleUrl: './stock-producto-form.scss'
})
export class StockProductoForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private stockProductoService = inject(StockProductoService);
    private almacenService = inject(AlmacenService);
    private productoService = inject(ProductoService);
    private snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<StockProductoForm>);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    // #region Datos (Selects)
    isLoadingAlmacenes = signal(false);
    selectAlmacenes = signal<ISelectItem[]>([]);
    isLoadingProductos = signal(false);
    selectProductos = signal<ISelectItem[]>([]);
    // #endregion

    // #region Stock Disponible Calculado
    stockDisponible = computed(() => {
        const actual = this.form?.get('dStockActual')?.value || 0;
        const comprometido = this.form?.get('dStockComprometido')?.value || 0;
        return actual - comprometido;
    });
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: StockProductoFormData) {
        this.isEdit.set(!!data.stock);

        this.form = this.fb.group({
            iIdAlmacen: [null, [Validators.required]],
            iIdProducto: [null, [Validators.required]],
            dStockActual: [0, [Validators.required, Validators.min(0)]],
            dStockComprometido: [0, [Validators.required, Validators.min(0)]]
        }, { validators: this.stockValidator });

        // Subscribirse a cambios para validar stock comprometido <= stock actual
        this.form.get('dStockActual')?.valueChanges.subscribe(() => {
            this.form.get('dStockComprometido')?.updateValueAndValidity({ emitEvent: false });
        });
    }

    // Validador personalizado: Stock Comprometido no puede ser mayor que Stock Actual
    stockValidator(group: FormGroup): { [key: string]: boolean } | null {
        const actual = group.get('dStockActual')?.value || 0;
        const comprometido = group.get('dStockComprometido')?.value || 0;

        if (comprometido > actual) {
            return { stockInvalid: true };
        }
        return null;
    }

    ngOnInit(): void {
        // Cargar Almacenes y Productos
        this.cargarAlmacenes();
        this.cargarProductos();

        if (this.isEdit() && this.data.stock) {
            const stock = this.data.stock;
            this.form.patchValue({
                iIdAlmacen: stock.iIdAlmacen,
                iIdProducto: stock.iIdProducto,
                dStockActual: stock.dStockActual,
                dStockComprometido: stock.dStockComprometido
            });

            // En modo edición, los campos Almacén y Producto son de solo lectura
            this.form.get('iIdAlmacen')?.disable();
            this.form.get('iIdProducto')?.disable();
        }
    }

    // #region Carga de Datos (Selects)
    cargarAlmacenes(): void {
        this.isLoadingAlmacenes.set(true);
        this.almacenService.listarAlmacenes({ iPageNumber: 1, iPageSize: 1000, bActivo: true }).pipe(
            finalize(() => this.isLoadingAlmacenes.set(false))
        ).subscribe({
            next: (response) => {
                this.selectAlmacenes.set(response.aRecords.map(a => ({
                    iIdElemento: a.iIdAlmacen,
                    vDescripcion: a.vNombre
                })));
            },
            error: (err) => {
                console.error('Error cargando almacenes', err);
            }
        });
    }

    cargarProductos(): void {
        this.isLoadingProductos.set(true);
        this.productoService.listarProductos({ iPageNumber: 1, iPageSize: 1000, bActivo: true }).pipe(
            finalize(() => this.isLoadingProductos.set(false))
        ).subscribe({
            next: (response) => {
                this.selectProductos.set(response.aRecords.map(p => ({
                    iIdElemento: p.iIdProducto,
                    vDescripcion: `${p.vCodigo} - ${p.vTitulo}`
                })));
            },
            error: (err) => {
                console.error('Error cargando productos', err);
            }
        });
    }
    // #endregion

    // #region Acciones del Diálogo
    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();

            if (this.form.hasError('stockInvalid')) {
                this.snackBar.open('El Stock Comprometido no puede ser mayor que el Stock Actual.', 'Cerrar', {
                    duration: 4000,
                    panelClass: ['snackbar-warn']
                });
            } else {
                this.snackBar.open('Por favor, complete los campos requeridos correctamente.', 'Cerrar', {
                    duration: 3000,
                    panelClass: ['snackbar-warn']
                });
            }
            return;
        }

        this.isLoading.set(true);

        // Obtener los valores incluyendo los campos deshabilitados
        const formValue = this.form.getRawValue();
        const request: IStockProductoCreateUpdateRequest = {
            iIdAlmacen: formValue.iIdAlmacen,
            iIdProducto: formValue.iIdProducto,
            dStockActual: formValue.dStockActual,
            dStockComprometido: formValue.dStockComprometido
        };

        this.stockProductoService.crearActualizarStockProducto(request).pipe(
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