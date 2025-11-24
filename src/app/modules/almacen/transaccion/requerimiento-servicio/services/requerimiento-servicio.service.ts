import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';

import { IRequerimientoServicioListadoRequest } from '../interfaces/request/IRequerimientoServicioListadoRequest.interface';
import { IRequerimientoServicioListadoResponse } from '../interfaces/response/IRequerimientoServicioListadoResponse.interface';
import { IRequerimientoServicioCreateUpdateRequest } from '../interfaces/request/IRequerimientoServicioCreateUpdateRequest.interface';
import { IRequerimientoServicioCreateUpdateResponse } from '../interfaces/response/IRequerimientoServicioCreateUpdateResponse.interface';
import { IRequerimientoServicioDeleteResponse } from '../interfaces/response/IRequerimientoServicioDeleteResponse.interface';
import { IRequerimientoServicioDetalleListadoRequest } from '../interfaces/request/IRequerimientoServicioDetalleListadoRequest.interface';
import { IRequerimientoServicioDetalleListadoResponse } from '../interfaces/response/IRequerimientoServicioDetalleListadoResponse.interface';
import { IRequerimientoServicioDetalleCreateUpdateRequest } from '../interfaces/request/IRequerimientoServicioDetalleCreateUpdateRequest.interface';
import { IRequerimientoServicioDetalleCreateUpdateResponse } from '../interfaces/response/IRequerimientoServicioDetalleCreateUpdateResponse.interface';
import { IRequerimientoServicioDetalleDeleteResponse } from '../interfaces/response/IRequerimientoServicioDetalleDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class RequerimientoServicioService {

    private http = inject(HttpClient);
    private snackBar = inject(MatSnackBar);
    private apiUrl = `${environment.UrlBase}/requerimiento-servicio`;

    // #region Listado
    listarRequerimientosServicio(request: IRequerimientoServicioListadoRequest): Observable<IPaginationResponse<IRequerimientoServicioListadoResponse>> {
        const url = `${this.apiUrl}/ListadoRequerimientoServicio`;
        return this.http.post<IApiResponse<IPaginationResponse<IRequerimientoServicioListadoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener requerimientos');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarRequerimientoServicio(request: IRequerimientoServicioCreateUpdateRequest): Observable<IRequerimientoServicioCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarRequerimientoServicio`;
        return this.http.post<IApiResponse<IRequerimientoServicioCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de requerimiento');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Anular
    anularRequerimientoServicio(iIdRequerimientoServicio: number): Observable<IRequerimientoServicioDeleteResponse> {
        const url = `${this.apiUrl}/AnularRequerimientoServicio/${iIdRequerimientoServicio}`;
        return this.http.delete<IApiResponse<IRequerimientoServicioDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al anular el requerimiento');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // ==========================================================================
    //                                  DETALLE
    // ==========================================================================

    // #region DETALLE - Listado
    listarDetallesRequerimientoServicio(request: IRequerimientoServicioDetalleListadoRequest): Observable<IPaginationResponse<IRequerimientoServicioDetalleListadoResponse>> {
        const url = `${this.apiUrl}/ListadoDetalle`;
        return this.http.post<IApiResponse<IPaginationResponse<IRequerimientoServicioDetalleListadoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al listar detalles');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region DETALLE - Crear/Actualizar
    crearActualizarDetalleRequerimientoServicio(request: IRequerimientoServicioDetalleCreateUpdateRequest): Observable<IRequerimientoServicioDetalleCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarDetalle`;
        return this.http.post<IApiResponse<IRequerimientoServicioDetalleCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar detalle');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region DETALLE - Eliminar
    eliminarDetalleRequerimientoServicio(iIdRequerimientoServicioDetalle: number): Observable<IRequerimientoServicioDetalleDeleteResponse> {
        const url = `${this.apiUrl}/EliminarDetalle/${iIdRequerimientoServicioDetalle}`;
        return this.http.delete<IApiResponse<IRequerimientoServicioDetalleDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar detalle');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}
