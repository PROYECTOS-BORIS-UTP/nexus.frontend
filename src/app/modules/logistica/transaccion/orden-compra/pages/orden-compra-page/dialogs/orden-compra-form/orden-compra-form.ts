import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, of, forkJoin, switchMap } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IOrdenCompraCreateUpdateRequest } from '../../../../interfaces/request/IOrdenCompraCreateUpdateRequest.interface';
import { OrdenCompraService } from '../../../../services/orden-compra.service';
import { IOrdenCompraDetalleListadoRequest } from '../../../../interfaces/request/IOrdenCompraDetalleListadoRequest.interface';
import { IOrdenCompraDetalleCreateUpdateRequest } from '../../../../interfaces/request/IOrdenCompraDetalleCreateUpdateRequest.interface';
import { IOrdenCompraCreateUpdateResponse } from '../../../../interfaces/response/IOrdenCompraCreateUpdateResponse.interface';
import { ICompaniaListadoRequest } from '../../../../../../../configuracion/maestras/compania/interfaces/request/ICompaniaListadoRequest.interface';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';
import { UnidadMedidaService } from '../../../../../../../logistica/mantenimiento/unidad-medida/services/unidad-medida.service';
import { IUnidadMedidaListadoRequest } from '../../../../../../../logistica/mantenimiento/unidad-medida/interfaces/request/IUnidadMedidaListadoRequest.interface';
import { ProveedorService } from '../../../../../../../logistica/mantenimiento/proveedor/services/proveedor.service';
import { IProveedorListadoRequest } from '../../../../../../../logistica/mantenimiento/proveedor/interfaces/request/IProveedorListadoRequest.interface';
import { MonedaService } from '../../../../../../../configuracion/maestras/moneda/services/moneda.service';
import { IMonedaListadoRequest } from '../../../../../../../configuracion/maestras/moneda/interfaces/request/IMonedaListadoRequest.interface';
import { ElementoSistemaService } from '../../../../../../../configuracion/maestras/elemento-sistema/services/elemento-sistema.service';
import { IProductoCatalogo } from '../../../../../../../almacen/mantenimiento/almacen/pages/almacen-page/dialogs/almacen-form/dialogs/interfaces/IProductoCatalogo.interface';
import { ProductoSelector } from '../../../../../../../almacen/mantenimiento/almacen/pages/almacen-page/dialogs/almacen-form/dialogs/producto-selector/producto-selector';

export interface OrdenCompraFormData {
    ordenCompra?: IOrdenCompraCreateUpdateRequest;
}

@Component({
    selector: 'app-orden-compra-form',
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
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './orden-compra-form.html',
    styleUrl: './orden-compra-form.scss'
})
export class OrdenCompraForm implements OnInit {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private ordenCompraService = inject(OrdenCompraService);
    private snackBar = inject(MatSnackBar);
    private companiaService = inject(CompaniaService);
    private proveedorService = inject(ProveedorService);
    private monedaService = inject(MonedaService);
    private elementoSistemaService = inject(ElementoSistemaService);
    private unidadMedidaService = inject(UnidadMedidaService);
    public dialogRef = inject(MatDialogRef<OrdenCompraForm>);
    private dialogService = inject(MatDialog);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    detallesEliminados: number[] = [];
    // #endregion

    // #region Datos (Selects)
    isLoadingCompanias = signal(false);
    selectCompanias = signal<ISelectItem[]>([]);

    isLoadingProveedores = signal(false);
    selectProveedores = signal<ISelectItem[]>([]);

    isLoadingMonedas = signal(false);
    selectMonedas = signal<ISelectItem[]>([]);

    isLoadingFormasPago = signal(false);
    selectFormasPago = signal<ISelectItem[]>([]);

    selectUnidadMedida = signal<ISelectItem[]>([]);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: OrdenCompraFormData) {
        this.isEdit.set(!!data.ordenCompra);

        this.form = this.fb.group({
            iIdOrdenCompra: [0],
            iIdCompania: [null, [Validators.required, Validators.min(1)]],
            iIdProveedor: [null, [Validators.required, Validators.min(1)]],
            vNumeroOrden: [{ value: '', disabled: true }],
            dFechaEmision: [new Date(), [Validators.required]],
            dFechaEntrega: [null],
            iIdMoneda: [null, [Validators.required, Validators.min(1)]],
            nTipoCambio: [1, [Validators.required, Validators.min(0.001)]],
            iIdFormaPago: [null, [Validators.required, Validators.min(1)]],
            vLugarEntrega: [null, [Validators.maxLength(500)]],
            vObservacion: [null, [Validators.maxLength(1000)]],

            // Totales (Calculados)
            nSubTotal: [{ value: 0, disabled: true }],
            nIGV: [{ value: 0, disabled: true }],
            nTotal: [{ value: 0, disabled: true }],

            detalles: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.cargarCompanias();
        this.cargarProveedores();
        this.cargarMonedas();
        this.cargarFormasPago();
        this.cargarUnidadesMedida();

        if (this.isEdit() && this.data.ordenCompra) {
            this.cargarDatosEdicion();
        } else {
            this.form.get('vNumeroOrden')?.setValue('---');
        }

        // Recalcular totales cuando cambien los detalles
        this.detallesArr.valueChanges.subscribe(() => this.calcularTotales());
    }

    get detallesArr(): FormArray {
        return this.form.get('detalles') as FormArray;
    }

    // #region Gestión de Detalles
    abrirSelectorProductos(): void {
        const dialogRef = this.dialogService.open(ProductoSelector, {
            width: '100%',
            maxWidth: '700px',
            disableClose: false
        });

        dialogRef.afterClosed().subscribe((productosSeleccionados: IProductoCatalogo[]) => {
            if (productosSeleccionados && productosSeleccionados.length > 0) {
                productosSeleccionados.forEach(prod => {
                    const existe = this.detallesArr.controls.some(
                        ctrl => ctrl.get('iIdProducto')?.value === prod.iIdProducto
                    );

                    if (!existe) {
                        this.detallesArr.push(this.crearDetalleGroup({
                            iIdProducto: prod.iIdProducto,
                            vProductoNombre: prod.vDescripcion,
                            iIdUnidadMedida: prod.iIdUnidadMedida,
                            dCantidad: 1,
                            dPrecioUnitario: 0 // Default
                        }));
                    }
                });
                this.mostrarSnack(`${productosSeleccionados.length} productos agregados.`, 'snackbar-success');
                this.calcularTotales();
            }
        });
    }

    crearDetalleGroup(data?: any): FormGroup {
        return this.fb.group({
            iIdOrdenCompraDetalle: [data?.iIdOrdenCompraDetalle || 0],
            iIdProducto: [data?.iIdProducto || null, Validators.required],
            vProductoNombre: [data?.vProductoNombre || 'Producto', Validators.required],
            dCantidad: [data?.dCantidad || 1, [Validators.required, Validators.min(0.01)]],
            dPrecioUnitario: [data?.dPrecioUnitario || 0, [Validators.required, Validators.min(0)]],
            iIdUnidadMedida: [data?.iIdUnidadMedida || null, Validators.required],
            dTotalLinea: [{ value: (data?.dCantidad || 0) * (data?.dPrecioUnitario || 0), disabled: true }]
        });
    }

    eliminarDetalle(index: number): void {
        const group = this.detallesArr.at(index) as FormGroup;
        const idDetalle = group.value.iIdOrdenCompraDetalle;

        if (idDetalle > 0) {
            this.detallesEliminados.push(idDetalle);
        }

        this.detallesArr.removeAt(index);
        this.calcularTotales();
    }

    calcularTotales(): void {
        let subTotal = 0;
        this.detallesArr.controls.forEach(control => {
            const cant = control.get('dCantidad')?.value || 0;
            const precio = control.get('dPrecioUnitario')?.value || 0;
            const totalLinea = cant * precio;
            control.get('dTotalLinea')?.setValue(totalLinea, { emitEvent: false });
            subTotal += totalLinea;
        });

        const igv = subTotal * 0.18; // TODO: Parametrizar IGV
        const total = subTotal + igv;

        this.form.patchValue({
            nSubTotal: subTotal,
            nIGV: igv,
            nTotal: total
        }, { emitEvent: false });
    }
    // #endregion

    // #region Carga de Datos (Selects)
    cargarCompanias(): void {
        this.isLoadingCompanias.set(true);
        this.companiaService.listarCompanias({ iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoadingCompanias.set(false)))
            .subscribe({
                next: (resp) => this.selectCompanias.set(resp.aRecords.map(c => ({ iIdElemento: c.iIdCompania, vDescripcion: c.vRazonSocial }))),
                error: (err) => console.error('Error cargando compañías', err)
            });
    }

    cargarProveedores(): void {
        this.isLoadingProveedores.set(true);
        this.proveedorService.listarProveedores({ iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoadingProveedores.set(false)))
            .subscribe({
                next: (resp) => this.selectProveedores.set(resp.aRecords.map(p => ({ iIdElemento: p.iIdProveedor, vDescripcion: p.vRazonSocial }))),
                error: (err) => console.error('Error cargando proveedores', err)
            });
    }

    cargarMonedas(): void {
        this.isLoadingMonedas.set(true);
        this.monedaService.listarMonedas({ iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoadingMonedas.set(false)))
            .subscribe({
                next: (resp) => this.selectMonedas.set(resp.aRecords.map(m => ({ iIdElemento: m.iIdMoneda, vDescripcion: m.vDescripcion }))),
                error: (err) => console.error('Error cargando monedas', err)
            });
    }

    cargarFormasPago(): void {
        this.isLoadingFormasPago.set(true);
        // Asumiendo código 'FORMA_PAGO' para elemento sistema
        this.elementoSistemaService.listarPorCodigoPadre({ vCodigoPadre: 'FORMA_PAGO' })
            .pipe(finalize(() => this.isLoadingFormasPago.set(false)))
            .subscribe({
                next: (resp) => this.selectFormasPago.set(resp),
                error: (err) => console.error('Error cargando formas de pago', err)
            });
    }

    cargarUnidadesMedida(): void {
        this.unidadMedidaService.listarUnidadesMedida({ iPageNumber: 1, iPageSize: 1000 })
            .subscribe({
                next: (resp) => this.selectUnidadMedida.set(resp.aRecords.map(u => ({ iIdElemento: u.iIdUnidadMedida, vDescripcion: u.vDescripcion }))),
                error: (err) => console.error('Error cargando unidades', err)
            });
    }

    cargarDatosEdicion(): void {
        const oc = this.data.ordenCompra!;
        this.form.patchValue({
            ...oc,
            dFechaEmision: oc.dFechaEmision ? new Date(oc.dFechaEmision) : null,
            dFechaEntrega: oc.dFechaEntrega ? new Date(oc.dFechaEntrega) : null
        });

        this.isLoading.set(true);
        this.ordenCompraService.listarOrdenCompraDetalle({ iIdOrdenCompra: oc.iIdOrdenCompra!, iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (resp) => {
                    this.detallesArr.clear();
                    resp.aRecords.forEach(det => this.detallesArr.push(this.crearDetalleGroup(det)));
                    this.calcularTotales();
                },
                error: (err) => console.error('Error cargando detalles', err)
            });
    }
    // #endregion

    // #region Guardar
    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.mostrarSnack('Complete los campos obligatorios.', 'snackbar-warn');
            return;
        }

        if (this.detallesArr.length === 0) {
            this.mostrarSnack('Agregue al menos un producto.', 'snackbar-warn');
            return;
        }

        this.isLoading.set(true);
        const formVal = this.form.getRawValue();

        const requestCabecera: IOrdenCompraCreateUpdateRequest = {
            iIdOrdenCompra: formVal.iIdOrdenCompra,
            iIdCompania: formVal.iIdCompania,
            iIdProveedor: formVal.iIdProveedor,
            vNumeroOrden: this.isEdit() ? formVal.vNumeroOrden : '',
            dFechaEmision: this.formatDate(formVal.dFechaEmision)!,
            dFechaEntrega: this.formatDate(formVal.dFechaEntrega) || undefined,
            iIdMoneda: formVal.iIdMoneda,
            nTipoCambio: formVal.nTipoCambio,
            iIdFormaPago: formVal.iIdFormaPago,
            nSubTotal: formVal.nSubTotal,
            nIGV: formVal.nIGV,
            nTotal: formVal.nTotal,
            vObservacion: formVal.vObservacion,
            vLugarEntrega: formVal.vLugarEntrega,
            iIdEstado: 1, // Pendiente
            bActivo: true
        };

        this.ordenCompraService.crearActualizarOrdenCompra(requestCabecera).pipe(
            switchMap((respCabecera) => {
                const idCabecera = respCabecera.iIdOrdenCompra;

                if (respCabecera.vMensaje && !this.isEdit()) {
                    // Si devuelve el número de orden en el mensaje o similar, podríamos actualizarlo
                }

                const peticiones = [];

                for (let control of this.detallesArr.controls) {
                    const detVal = control.value;
                    const reqDet: IOrdenCompraDetalleCreateUpdateRequest = {
                        iIdOrdenCompraDetalle: detVal.iIdOrdenCompraDetalle,
                        iIdOrdenCompra: idCabecera,
                        iIdProducto: detVal.iIdProducto,
                        iIdUnidadMedida: detVal.iIdUnidadMedida,
                        dCantidad: detVal.dCantidad,
                        dPrecioUnitario: detVal.dPrecioUnitario
                    };
                    peticiones.push(this.ordenCompraService.crearActualizarOrdenCompraDetalle(reqDet));
                }

                this.detallesEliminados.forEach(id => {
                    peticiones.push(this.ordenCompraService.eliminarOrdenCompraDetalle({ iIdOrdenCompraDetalle: id }));
                });

                return peticiones.length ? forkJoin(peticiones) : of([]);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: () => {
                this.mostrarSnack('Orden de Compra guardada.', 'snackbar-success');
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error guardando OC', err);
                this.mostrarSnack('Error al guardar.', 'snackbar-error');
            }
        });
    }

    onClose(): void {
        this.dialogRef.close();
    }

    private formatDate(date: Date | string | null): string | null {
        if (!date) return null;
        try {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().split('T')[0];
        } catch { return null; }
    }

    private mostrarSnack(msg: string, cls: string) {
        this.snackBar.open(msg, 'Cerrar', { duration: 3000, panelClass: [cls] });
    }
    // #endregion
}
