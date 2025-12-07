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

// Services
import { CotizacionService } from '../../../../services/cotizacion.service';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';
import { MonedaService } from '../../../../../../../configuracion/maestras/moneda/services/moneda.service';
import { UnidadMedidaService } from '../../../../../../../logistica/mantenimiento/unidad-medida/services/unidad-medida.service';

// DTOs
import { ICotizacionCreateUpdateRequest } from '../../../../interfaces/request/ICotizacionCreateUpdateRequest.interface';
import { ICotizacionDetalleCreateUpdateRequest } from '../../../../interfaces/request/ICotizacionDetalleCreateUpdateRequest.interface';
import { IServicioResponse } from '../../../../../../../logistica/mantenimiento/servicio/interfaces/response/IServicioResponse.interface';

// Selector
import { ServicioSelector } from '../../../../../../../almacen/transaccion/requerimiento-servicio/pages/requerimiento-servicio-page/dialogs/requerimiento-servicio-form/dialogs/servicio-selector/servicio-selector';
import { ClienteService } from '../../../../../../mantenimiento/cliente/services/cliente.service';
import { ClienteContactoService } from '../../../../../../mantenimiento/cliente-contacto/services/cliente-contacto.service';

export interface CotizacionFormData {
    cotizacion?: ICotizacionCreateUpdateRequest;
}

@Component({
    selector: 'app-cotizacion-form',
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
    templateUrl: './cotizacion-form.html',
    styleUrl: './cotizacion-form.scss'
})
export class CotizacionForm implements OnInit {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private cotizacionService = inject(CotizacionService);
    private snackBar = inject(MatSnackBar);
    private companiaService = inject(CompaniaService);
    private clienteService = inject(ClienteService);
    private clienteContactoService = inject(ClienteContactoService);
    private monedaService = inject(MonedaService);
    private unidadMedidaService = inject(UnidadMedidaService);
    public dialogRef = inject(MatDialogRef<CotizacionForm>);
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

    isLoadingClientes = signal(false);
    selectClientes = signal<ISelectItem[]>([]);

    isLoadingContactos = signal(false);
    selectContactos = signal<ISelectItem[]>([]);

    isLoadingMonedas = signal(false);
    selectMonedas = signal<ISelectItem[]>([]);

    selectUnidadMedida = signal<ISelectItem[]>([]);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: CotizacionFormData) {
        this.isEdit.set(!!data.cotizacion);

        this.form = this.fb.group({
            iIdCotizacion: [0],
            iIdCompania: [null, [Validators.required, Validators.min(1)]],
            iIdCliente: [null, [Validators.required, Validators.min(1)]],
            iIdClienteContacto: [null],
            vNumeroCotizacion: [{ value: '', disabled: true }],
            dFechaEmision: [new Date(), [Validators.required]],
            dFechaVencimiento: [new Date(), [Validators.required]],
            iIdMoneda: [null, [Validators.required, Validators.min(1)]],
            nTipoCambio: [1, [Validators.required, Validators.min(0.001)]],
            vObservacion: [null, [Validators.maxLength(1000)]],
            vCondicionesComerciales: [null],

            // Totales (Calculados)
            nSubTotal: [{ value: 0, disabled: true }],
            nIGV: [{ value: 0, disabled: true }],
            nTotal: [{ value: 0, disabled: true }],

            detalles: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.cargarCompanias();
        this.cargarClientes();
        this.cargarMonedas();
        this.cargarUnidadesMedida();

        this.form.get('iIdCliente')?.valueChanges.subscribe(val => {
            if (val) {
                this.cargarContactos(val);
            } else {
                this.selectContactos.set([]);
            }
        });

        if (this.isEdit() && this.data.cotizacion) {
            this.cargarDatosEdicion();
        } else {
            this.form.get('vNumeroCotizacion')?.setValue('---');
            const today = new Date();
            const venc = new Date();
            venc.setDate(today.getDate() + 15);
            this.form.get('dFechaVencimiento')?.setValue(venc);
        }

        this.detallesArr.valueChanges.subscribe(() => this.calcularTotales());
    }

    get detallesArr(): FormArray {
        return this.form.get('detalles') as FormArray;
    }

    // #region Gestión de Detalles
    abrirSelectorServicios(): void {
        const dialogRef = this.dialogService.open(ServicioSelector, {
            width: '100%',
            maxWidth: '700px',
            disableClose: false
        });

        dialogRef.afterClosed().subscribe((serviciosSeleccionados: IServicioResponse[]) => {
            if (serviciosSeleccionados && serviciosSeleccionados.length > 0) {
                serviciosSeleccionados.forEach(serv => {
                    const existe = this.detallesArr.controls.some(
                        ctrl => ctrl.get('iIdServicio')?.value === serv.iIdServicio
                    );

                    if (!existe) {
                        this.detallesArr.push(this.crearDetalleGroup({
                            iIdServicio: serv.iIdServicio,
                            vServicioNombre: serv.vTitulo || serv.vDescripcion,
                            vDescripcion: serv.vDescripcion,
                            iIdUnidadMedida: serv.iIdUnidadMedida,
                            vUnidadMedida: serv.vUnidadMedida,
                            dCantidad: 1,
                            dPrecioUnitario: 0
                        }));
                    }
                });
                this.mostrarSnack(`${serviciosSeleccionados.length} servicios agregados.`, 'snackbar-success');
                this.calcularTotales();
            }
        });
    }

    crearDetalleGroup(data?: any): FormGroup {
        return this.fb.group({
            iIdCotizacionDetalle: [data?.iIdCotizacionDetalle || 0],
            iIdServicio: [data?.iIdServicio || null, Validators.required],
            vServicioNombre: [data?.vServicioNombre || 'Servicio', Validators.required],
            vDescripcion: [data?.vDescripcion || ''],
            dCantidad: [data?.dCantidad || 1, [Validators.required, Validators.min(0.01)]],
            dPrecioUnitario: [data?.dPrecioUnitario || 0, [Validators.required, Validators.min(0)]],
            iIdUnidadMedida: [data?.iIdUnidadMedida || null, Validators.required],
            vUnidadMedida: [data?.vUnidadMedida || 'UND'],
            dTotalLinea: [{ value: (data?.dCantidad || 0) * (data?.dPrecioUnitario || 0), disabled: true }]
        });
    }

    eliminarDetalle(index: number): void {
        const group = this.detallesArr.at(index) as FormGroup;
        const idDetalle = group.value.iIdCotizacionDetalle;

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

        const igv = subTotal * 0.18;
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

    cargarClientes(): void {
        this.isLoadingClientes.set(true);
        this.clienteService.ListadoCliente({ iPageNumber: 1, iPageSize: 1000 })
            .pipe(finalize(() => this.isLoadingClientes.set(false)))
            .subscribe({
                next: (resp) => this.selectClientes.set(resp.aRecords.map(c => ({ iIdElemento: c.iIdCliente, vDescripcion: c.vRazonSocial }))),
                error: (err) => console.error('Error cargando clientes', err)
            });
    }

    cargarContactos(iIdCliente: number): void {
        this.isLoadingContactos.set(true);
        this.clienteContactoService.ListadoClienteContacto({ iIdCliente: iIdCliente, iPageNumber: 1, iPageSize: 1000 } as any)
            .pipe(finalize(() => this.isLoadingContactos.set(false)))
            .subscribe({
                next: (resp) => this.selectContactos.set(resp.aRecords.map((c: any) => ({ iIdElemento: c.iIdClienteContacto, vDescripcion: c.vNombreCompleto || `${c.vNombres} ${c.vApellidos}` }))),
                error: (err) => {
                    console.error('Error cargando contactos', err);
                    this.selectContactos.set([]);
                }
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

    cargarUnidadesMedida(): void {
        this.unidadMedidaService.listarUnidadesMedida({ iPageNumber: 1, iPageSize: 1000 })
            .subscribe({
                next: (resp) => this.selectUnidadMedida.set(resp.aRecords.map(u => ({ iIdElemento: u.iIdUnidadMedida, vDescripcion: u.vDescripcion }))),
                error: (err) => console.error('Error cargando unidades medida', err)
            });
    }

    cargarDatosEdicion(): void {
        const cot = this.data.cotizacion!;
        this.form.patchValue({
            ...cot,
            dFechaEmision: cot.dFechaEmision ? new Date(cot.dFechaEmision) : null,
            dFechaVencimiento: cot.dFechaVencimiento ? new Date(cot.dFechaVencimiento) : null
        });

        if (cot.iIdCliente) {
            this.cargarContactos(cot.iIdCliente);
        }

        this.isLoading.set(true);
        this.cotizacionService.listarCotizacionDetalle({ iIdCotizacion: cot.iIdCotizacion!, iPageNumber: 1, iPageSize: 1000 } as any)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (resp) => {
                    this.detallesArr.clear();
                    resp.aRecords.forEach(det => this.detallesArr.push(this.crearDetalleGroup({
                        ...det,
                        vServicioNombre: det.vServicioNombre,
                        vUnidadMedida: det.vUnidadMedida
                    })));
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

        const requestCabecera: ICotizacionCreateUpdateRequest = {
            iIdCotizacion: formVal.iIdCotizacion,
            iIdCompania: formVal.iIdCompania,
            iIdCliente: formVal.iIdCliente,
            iIdClienteContacto: formVal.iIdClienteContacto,
            dFechaEmision: this.formatDate(formVal.dFechaEmision)!,
            dFechaVencimiento: this.formatDate(formVal.dFechaVencimiento)!,
            iIdMoneda: formVal.iIdMoneda,
            nTipoCambio: formVal.nTipoCambio,
            nSubTotal: formVal.nSubTotal,
            nIGV: formVal.nIGV,
            nTotal: formVal.nTotal,
            vObservacion: formVal.vObservacion,
            vCondicionesComerciales: formVal.vCondicionesComerciales,
            iIdEstado: 1,
            bActivo: true
        };

        this.cotizacionService.crearActualizarCotizacion(requestCabecera).pipe(
            switchMap((respCabecera) => {
                const idCabecera = respCabecera.iIdCotizacion;

                const peticiones = [];

                for (let control of this.detallesArr.controls) {
                    const detVal = control.value;
                    const reqDet: ICotizacionDetalleCreateUpdateRequest = {
                        iIdCotizacionDetalle: detVal.iIdCotizacionDetalle,
                        iIdCotizacion: idCabecera,
                        iIdServicio: detVal.iIdServicio,
                        vDescripcion: detVal.vDescripcion,
                        dCantidad: detVal.dCantidad,
                        dPrecioUnitario: detVal.dPrecioUnitario,
                        iIdUnidadMedida: detVal.iIdUnidadMedida
                    };
                    peticiones.push(this.cotizacionService.crearActualizarCotizacionDetalle(reqDet));
                }

                this.detallesEliminados.forEach(id => {
                    peticiones.push(this.cotizacionService.eliminarCotizacionDetalle({ iIdCotizacionDetalle: id }));
                });

                return peticiones.length ? forkJoin(peticiones) : of([]);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: () => {
                this.mostrarSnack('Cotización guardada exitosamente.', 'snackbar-success');
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error guardando Cotización', err);
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
