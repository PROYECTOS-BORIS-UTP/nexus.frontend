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
import { IOrdenServicioCreateUpdateRequest } from '../../../../interfaces/request/IOrdenServicioCreateUpdateRequest.interface';
import { OrdenServicioService } from '../../../../services/orden-servicio.service';
import { IOrdenServicioDetalleCreateUpdateRequest } from '../../../../interfaces/request/IOrdenServicioDetalleCreateUpdateRequest.interface';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';
import { ProveedorService } from '../../../../../../../logistica/mantenimiento/proveedor/services/proveedor.service';
import { MonedaService } from '../../../../../../../configuracion/maestras/moneda/services/moneda.service';
import { ElementoSistemaService } from '../../../../../../../configuracion/maestras/elemento-sistema/services/elemento-sistema.service';
import { ServicioService } from '../../../../../../../logistica/mantenimiento/servicio/services/servicio.service';

export interface OrdenServicioFormData {
    ordenServicio?: IOrdenServicioCreateUpdateRequest;
}

@Component({
    selector: 'app-orden-servicio-form',
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
    templateUrl: './orden-servicio-form.html',
    styleUrl: './orden-servicio-form.scss'
})
export class OrdenServicioForm implements OnInit {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private ordenServicioService = inject(OrdenServicioService);
    private snackBar = inject(MatSnackBar);
    private companiaService = inject(CompaniaService);
    private proveedorService = inject(ProveedorService);
    private monedaService = inject(MonedaService);
    private elementoSistemaService = inject(ElementoSistemaService);
    private servicioService = inject(ServicioService);
    public dialogRef = inject(MatDialogRef<OrdenServicioForm>);
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

    isLoadingServicios = signal(false);
    selectServicios = signal<ISelectItem[]>([]);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: OrdenServicioFormData) {
        this.isEdit.set(!!data.ordenServicio);

        this.form = this.fb.group({
            iIdOrdenServicio: [0],
            iIdCompania: [null, [Validators.required, Validators.min(1)]],
            iIdProveedor: [null, [Validators.required, Validators.min(1)]],
            vNumeroOrden: [{ value: '', disabled: true }],
            dFechaEmision: [new Date(), [Validators.required]],
            dFechaInicio: [null],
            dFechaFin: [null],
            iIdMoneda: [null, [Validators.required, Validators.min(1)]],
            nTipoCambio: [1, [Validators.required, Validators.min(0.001)]],
            iIdFormaPago: [null, [Validators.required, Validators.min(1)]],
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
        this.cargarServicios();

        if (this.isEdit() && this.data.ordenServicio) {
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
    agregarDetalle(): void {
        this.detallesArr.push(this.crearDetalleGroup());
    }

    crearDetalleGroup(data?: any): FormGroup {
        return this.fb.group({
            iIdOrdenServicioDetalle: [data?.iIdOrdenServicioDetalle || 0],
            iIdServicio: [data?.iIdServicio || null, Validators.required],
            vDescripcionEspecifica: [data?.vDescripcionEspecifica || '', [Validators.maxLength(500)]],
            dCantidad: [data?.dCantidad || 1, [Validators.required, Validators.min(0.01)]],
            dPrecioUnitario: [data?.dPrecioUnitario || 0, [Validators.required, Validators.min(0)]],
            dTotalLinea: [{ value: (data?.dCantidad || 0) * (data?.dPrecioUnitario || 0), disabled: true }]
        });
    }

    eliminarDetalle(index: number): void {
        const group = this.detallesArr.at(index) as FormGroup;
        const idDetalle = group.value.iIdOrdenServicioDetalle;

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
        this.elementoSistemaService.listarPorCodigoPadre({ vCodigoPadre: 'FORMA_PAGO' })
            .pipe(finalize(() => this.isLoadingFormasPago.set(false)))
            .subscribe({
                next: (resp) => this.selectFormasPago.set(resp),
                error: (err) => console.error('Error cargando formas de pago', err)
            });
    }

    cargarServicios(): void {
        this.isLoadingServicios.set(true);
        this.servicioService.listarServicios({ iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoadingServicios.set(false)))
            .subscribe({
                next: (resp) => this.selectServicios.set(resp.aRecords.map(s => ({ iIdElemento: s.iIdServicio, vDescripcion: s.vDescripcion }))),
                error: (err) => console.error('Error cargando servicios', err)
            });
    }

    cargarDatosEdicion(): void {
        const os = this.data.ordenServicio!;
        this.form.patchValue({
            ...os,
            dFechaEmision: os.dFechaEmision ? new Date(os.dFechaEmision) : null,
            dFechaInicio: os.dFechaInicio ? new Date(os.dFechaInicio) : null,
            dFechaFin: os.dFechaFin ? new Date(os.dFechaFin) : null
        });

        this.isLoading.set(true);
        this.ordenServicioService.listarOrdenServicioDetalle({ iIdOrdenServicio: os.iIdOrdenServicio! })
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (resp) => {
                    this.detallesArr.clear();
                    resp.forEach(det => this.detallesArr.push(this.crearDetalleGroup(det)));
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
            this.mostrarSnack('Agregue al menos un servicio.', 'snackbar-warn');
            return;
        }

        this.isLoading.set(true);
        const formVal = this.form.getRawValue();

        const requestCabecera: IOrdenServicioCreateUpdateRequest = {
            iIdOrdenServicio: formVal.iIdOrdenServicio,
            iIdCompania: formVal.iIdCompania,
            iIdProveedor: formVal.iIdProveedor,
            vNumeroOrden: this.isEdit() ? formVal.vNumeroOrden : '',
            dFechaEmision: this.formatDate(formVal.dFechaEmision)!,
            dFechaInicio: this.formatDate(formVal.dFechaInicio) || undefined,
            dFechaFin: this.formatDate(formVal.dFechaFin) || undefined,
            iIdMoneda: formVal.iIdMoneda,
            nTipoCambio: formVal.nTipoCambio,
            iIdFormaPago: formVal.iIdFormaPago,
            nSubTotal: formVal.nSubTotal,
            nIGV: formVal.nIGV,
            nTotal: formVal.nTotal,
            vObservacion: formVal.vObservacion,
            iIdEstado: 1, // Pendiente
            bActivo: true
        };

        this.ordenServicioService.crearActualizarOrdenServicio(requestCabecera).pipe(
            switchMap((respCabecera) => {
                const idCabecera = respCabecera.iIdOrdenServicio;

                const peticiones = [];

                for (let control of this.detallesArr.controls) {
                    const detVal = control.value;
                    const reqDet: IOrdenServicioDetalleCreateUpdateRequest = {
                        iIdOrdenServicioDetalle: detVal.iIdOrdenServicioDetalle,
                        iIdOrdenServicio: idCabecera,
                        iIdServicio: detVal.iIdServicio,
                        vDescripcionEspecifica: detVal.vDescripcionEspecifica,
                        dCantidad: detVal.dCantidad,
                        dPrecioUnitario: detVal.dPrecioUnitario
                    };
                    peticiones.push(this.ordenServicioService.crearActualizarOrdenServicioDetalle(reqDet));
                }

                this.detallesEliminados.forEach(id => {
                    peticiones.push(this.ordenServicioService.eliminarOrdenServicioDetalle({ iIdOrdenServicioDetalle: id }));
                });

                return peticiones.length ? forkJoin(peticiones) : of([]);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: () => {
                this.mostrarSnack('Orden de Servicio guardada.', 'snackbar-success');
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error guardando OS', err);
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
