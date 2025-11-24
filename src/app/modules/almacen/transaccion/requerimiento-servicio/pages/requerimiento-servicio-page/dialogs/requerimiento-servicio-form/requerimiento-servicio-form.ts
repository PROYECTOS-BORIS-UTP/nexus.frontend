import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
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
import { IRequerimientoServicioCreateUpdateRequest } from '../../../../interfaces/request/IRequerimientoServicioCreateUpdateRequest.interface';
import { RequerimientoServicioService } from '../../../../services/requerimiento-servicio.service';
import { IRequerimientoServicioDetalleListadoRequest } from '../../../../interfaces/request/IRequerimientoServicioDetalleListadoRequest.interface';
import { IRequerimientoServicioDetalleCreateUpdateRequest } from '../../../../interfaces/request/IRequerimientoServicioDetalleCreateUpdateRequest.interface';
import { IRequerimientoServicioCreateUpdateResponse } from '../../../../interfaces/response/IRequerimientoServicioCreateUpdateResponse.interface';
import { ICompaniaListadoRequest } from '../../../../../../../configuracion/maestras/compania/interfaces/request/ICompaniaListadoRequest.interface';
import { CompaniaService } from '../../../../../../../configuracion/maestras/compania/services/compania.service';
import { CentroCostoService } from '../../../../../../../configuracion/maestras/centro-costo/services/centro-costo.service';
import { ICentroCostoListadoRequest } from '../../../../../../../configuracion/maestras/centro-costo/interfaces/request/ICentroCostoListadoRequest.interface';
import { ServicioSelector } from './dialogs/servicio-selector/servicio-selector';
import { IServicioResponse } from '../../../../../../../logistica/mantenimiento/servicio/interfaces/response/IServicioResponse.interface';

export interface RequerimientoServicioFormData {
    requerimiento?: IRequerimientoServicioCreateUpdateRequest;
}

@Component({
    selector: 'app-requerimiento-servicio-form',
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
    templateUrl: './requerimiento-servicio-form.html',
    styleUrl: './requerimiento-servicio-form.scss'
})
export class RequerimientoServicioForm {
    // #region Inyecciones y Dependencias
    private fb = inject(FormBuilder);
    private requerimientoServicioService = inject(RequerimientoServicioService);
    private snackBar = inject(MatSnackBar);
    private companiaService = inject(CompaniaService);
    public dialogRef = inject(MatDialogRef<RequerimientoServicioForm>);
    private dialogService = inject(MatDialog);
    private centroCostoService = inject(CentroCostoService);
    // #endregion

    // #region Estado del Componente
    form: FormGroup;
    isEdit = signal(false);
    isLoading = signal(false);
    // #endregion

    // Almacena IDs de detalles que el usuario elimina visualmente para borrarlos en BD al guardar
    detallesEliminados: number[] = [];
    // #endregion

    // #region Datos (Selects)
    isLoadingCompanias = signal(false);
    selectCompanias = signal<ISelectItem[]>([]);
    isLoadingCentrosCosto = signal(false);
    selectCentrosCosto = signal<ISelectItem[]>([]);
    // #endregion

    constructor(@Inject(MAT_DIALOG_DATA) public data: RequerimientoServicioFormData) {
        this.isEdit.set(!!data.requerimiento);

        this.form = this.fb.group({
            iIdRequerimientoServicio: [0],
            iIdCompania: [null, [Validators.required, Validators.min(1)]],
            vSerie: [{ value: 'REQSER', disabled: true }, Validators.required],
            vNumero: [{ value: '', disabled: true }],
            dFechaSolicitud: [new Date(), [Validators.required]],
            iIdCentroCosto: [null, [Validators.required, Validators.min(1)]],
            vJustificacion: [null, [Validators.maxLength(1000)]],
            detalles: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.cargarCompanias();
        this.cargarCentrosCosto();

        if (this.isEdit() && this.data.requerimiento) {
            this.cargarDatosEdicion();
        } else {
            this.form.get('vNumero')?.setValue('---');
        }
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
                            vServicioNombre: serv.vTitulo,
                            dCantidad: 1,
                            dPrecioEstimado: 0,
                            vObservacion: ''
                        }));
                    }
                });
                this.mostrarSnack(`${serviciosSeleccionados.length} servicios agregados.`, 'snackbar-success');
            }
        });
    }

    crearDetalleGroup(data?: any): FormGroup {
        return this.fb.group({
            iIdRequerimientoServicioDetalle: [data?.iIdRequerimientoServicioDetalle || 0],
            iIdServicio: [data?.iIdServicio || null, Validators.required],
            vServicioNombre: [data?.vServicioNombre || 'Servicio Cargado', Validators.required],
            dCantidad: [data?.dCantidad || 1, [Validators.required, Validators.min(1)]],
            dPrecioEstimado: [data?.dPrecioEstimado || 0, [Validators.min(0)]],
            vObservacion: [data?.vObservacion || null]
        });
    }

    eliminarDetalle(index: number): void {
        const group = this.detallesArr.at(index) as FormGroup;
        const idDetalle = group.value.iIdRequerimientoServicioDetalle;

        if (idDetalle > 0) {
            this.detallesEliminados.push(idDetalle);
        }

        this.detallesArr.removeAt(index);
    }

    // #endregion

    // #region Carga de Datos (Selects)

    cargarCompanias(): void {
        this.isLoadingCompanias.set(true);
        const request: ICompaniaListadoRequest = {
            iPageNumber: 1,
            iPageSize: 1000,
        };

        this.companiaService.listarCompanias(request)
            .pipe(finalize(() => this.isLoadingCompanias.set(false)))
            .subscribe({
                next: (paginatedResponse) => {
                    this.selectCompanias.set(
                        paginatedResponse.aRecords.map(comp => ({
                            iIdElemento: comp.iIdCompania,
                            vDescripcion: comp.vRazonSocial
                        }))
                    );
                },
                error: (err) => {
                    console.error('Error al cargar Compañías:', err);
                    this.selectCompanias.set([]);
                }
            });
    }

    cargarCentrosCosto(): void {
        this.isLoadingCentrosCosto.set(true);
        const request: ICentroCostoListadoRequest = {
            iPageNumber: 1,
            iPageSize: 1000,
        };

        this.centroCostoService.listarCentrosCosto(request)
            .pipe(finalize(() => this.isLoadingCentrosCosto.set(false)))
            .subscribe({
                next: (response) => {
                    const items: ISelectItem[] = response.aRecords.map(cc => ({
                        iIdElemento: cc.iIdCentroCosto,
                        vDescripcion: cc.vNombre
                    }));

                    this.selectCentrosCosto.set(items);
                },
                error: (err) => {
                    console.error('Error al cargar Centros de Costo:', err);
                    this.mostrarSnack('Error al cargar centros de costo.', 'snackbar-error');
                }
            });
    }

    cargarDatosEdicion() {
        const req = this.data.requerimiento!;
        this.form.patchValue({
            ...req,
            dFechaSolicitud: req.dFechaSolicitud ? new Date(req.dFechaSolicitud + 'T00:00:00') : null,
        });

        this.isLoading.set(true);
        const payload: IRequerimientoServicioDetalleListadoRequest = {
            iIdRequerimientoServicio: req.iIdRequerimientoServicio!,
            iPageNumber: 1,
            iPageSize: 1000
        };

        this.requerimientoServicioService.listarDetallesRequerimientoServicio(payload)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (resp) => {
                    if (resp && resp.aRecords) {
                        this.detallesArr.clear();
                        resp.aRecords.forEach((det: any) => {
                            this.detallesArr.push(this.crearDetalleGroup(det));
                        });
                    }
                },
                error: (err) => console.error('Error cargando detalles', err)
            });
    }

    // #endregion

    // #region Acciones del Diálogo
    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.mostrarSnack('Por favor, complete los campos obligatorios.', 'snackbar-warn');
            return;
        }

        if (this.detallesArr.length === 0) {
            this.mostrarSnack('Debe agregar al menos un servicio al requerimiento.', 'snackbar-warn');
            return;
        }

        this.isLoading.set(true);
        const formVal = this.form.getRawValue();
        const numeroEnvio = this.isEdit() ? formVal.vNumero : '';

        const requestCabecera: IRequerimientoServicioCreateUpdateRequest = {
            iIdRequerimientoServicio: formVal.iIdRequerimientoServicio,
            iIdCompania: formVal.iIdCompania,
            vSerie: formVal.vSerie,
            vNumero: numeroEnvio,
            dFechaSolicitud: this.formatDate(formVal.dFechaSolicitud)!,
            iIdCentroCosto: formVal.iIdCentroCosto,
            iIdUsuarioSolicitante: 1, // TODO: Obtener del token/auth service
            iIdEstado: 1,
            vJustificacion: formVal.vJustificacion
        };

        this.requerimientoServicioService.crearActualizarRequerimientoServicio(requestCabecera).pipe(
            switchMap((respCabecera: IRequerimientoServicioCreateUpdateResponse) => {
                const idCabecera = respCabecera.iIdRequerimientoServicio;

                if (respCabecera.vMensaje && !this.isEdit()) {
                    // Si el mensaje contiene el numero generado, podriamos parsearlo, pero mejor recargamos o confiamos en el ID
                }

                // Si es nuevo, actualizamos el ID en el form para que los detalles se guarden con el ID correcto
                if (!this.isEdit()) {
                    this.form.patchValue({ iIdRequerimientoServicio: idCabecera });
                    this.isEdit.set(true);
                }


                const peticionesDetalle = [];

                for (let control of this.detallesArr.controls) {
                    if (control.invalid) continue;

                    const detVal = control.value;
                    const reqDetalle: IRequerimientoServicioDetalleCreateUpdateRequest = {
                        iIdRequerimientoServicioDetalle: detVal.iIdRequerimientoServicioDetalle,
                        iIdRequerimientoServicio: idCabecera,
                        iIdServicio: detVal.iIdServicio,
                        vDescripcionDetallada: detVal.vServicioNombre, // Usamos nombre como descripcion detallada por defecto si no hay campo especifico
                        dCantidad: detVal.dCantidad,
                        dPrecioEstimado: detVal.dPrecioEstimado,
                        vObservacion: detVal.vObservacion
                    };

                    peticionesDetalle.push(
                        this.requerimientoServicioService.crearActualizarDetalleRequerimientoServicio(reqDetalle)
                    );
                }

                this.detallesEliminados.forEach(idEliminar => {
                    peticionesDetalle.push(
                        this.requerimientoServicioService.eliminarDetalleRequerimientoServicio(idEliminar)
                    );
                });

                return peticionesDetalle.length > 0 ? forkJoin(peticionesDetalle) : of([]);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: () => {
                this.mostrarSnack('Requerimiento guardado exitosamente.', 'snackbar-success');
                this.dialogRef.close(true);
            },
            error: (err: any) => {
                console.error("Error en proceso de guardado:", err);
                this.mostrarSnack('Ocurrió un error al guardar el requerimiento.', 'snackbar-error');
            }
        });
    }

    // #endregion

    // #region Helpers
    onClose(): void {
        this.dialogRef.close(true);
    }

    private formatDate(date: Date | string | null): string | null {
        if (!date) return null;
        try {
            const d = new Date(date);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            return d.toISOString().split('T')[0];
        } catch { return null; }
    }

    private mostrarSnack(mensaje: string, clase: string) {
        this.snackBar.open(mensaje, 'Cerrar', {
            duration: 3000,
            panelClass: [clase]
        });
    }
    // #endregion
}
