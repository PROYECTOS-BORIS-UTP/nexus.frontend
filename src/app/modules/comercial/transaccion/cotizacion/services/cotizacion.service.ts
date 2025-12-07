import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';

import { ICotizacionListadoRequest } from '../interfaces/request/ICotizacionListadoRequest.interface';
import { ICotizacionResponse } from '../interfaces/response/ICotizacionResponse.interface';
import { ICotizacionCreateUpdateRequest } from '../interfaces/request/ICotizacionCreateUpdateRequest.interface';
import { ICotizacionCreateUpdateResponse } from '../interfaces/response/ICotizacionCreateUpdateResponse.interface';
import { ICotizacionDeleteRequest } from '../interfaces/request/ICotizacionDeleteRequest.interface';
import { ICotizacionDeleteResponse } from '../interfaces/response/ICotizacionDeleteResponse.interface';

import { ICotizacionDetalleListadoRequest } from '../interfaces/request/ICotizacionDetalleListadoRequest.interface';
import { ICotizacionDetalleResponse } from '../interfaces/response/ICotizacionDetalleResponse.interface';
import { ICotizacionDetalleCreateUpdateRequest } from '../interfaces/request/ICotizacionDetalleCreateUpdateRequest.interface';
import { ICotizacionDetalleCreateUpdateResponse } from '../interfaces/response/ICotizacionDetalleCreateUpdateResponse.interface';
import { ICotizacionDetalleDeleteRequest } from '../interfaces/request/ICotizacionDetalleDeleteRequest.interface';
import { ICotizacionDetalleDeleteResponse } from '../interfaces/response/ICotizacionDetalleDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class CotizacionService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/cotizacion`;

    // #region CABECERA

    listarCotizacion(request: ICotizacionListadoRequest): Observable<IPaginationResponse<ICotizacionResponse>> {
        const url = `${this.apiUrl}/ListadoCotizacion`;
        return this.http.post<IApiResponse<IPaginationResponse<ICotizacionResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener cotizaciones');
                }
            }),
            catchError(handleHttpError)
        );
    }

    crearActualizarCotizacion(request: ICotizacionCreateUpdateRequest): Observable<ICotizacionCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarCotizacion`;
        return this.http.post<IApiResponse<ICotizacionCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de cotización');
                }
            }),
            catchError(handleHttpError)
        );
    }

    eliminarCotizacion(request: ICotizacionDeleteRequest): Observable<ICotizacionDeleteResponse> {
        const url = `${this.apiUrl}/EliminarCotizacion/${request.iIdCotizacion}`;
        return this.http.delete<IApiResponse<ICotizacionDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al anular la cotización');
                }
            }),
            catchError(handleHttpError)
        );
    }

    // #endregion

    // #region DETALLE

    listarCotizacionDetalle(request: ICotizacionDetalleListadoRequest): Observable<IPaginationResponse<ICotizacionDetalleResponse>> {
        const url = `${this.apiUrl}/ListadoCotizacionDetalle`;
        return this.http.post<IApiResponse<IPaginationResponse<ICotizacionDetalleResponse>>>(url, request).pipe(
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

    crearActualizarCotizacionDetalle(request: ICotizacionDetalleCreateUpdateRequest): Observable<ICotizacionDetalleCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarCotizacionDetalle`;
        return this.http.post<IApiResponse<ICotizacionDetalleCreateUpdateResponse>>(url, request).pipe(
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

    eliminarCotizacionDetalle(request: ICotizacionDetalleDeleteRequest): Observable<ICotizacionDetalleDeleteResponse> {
        const url = `${this.apiUrl}/EliminarCotizacionDetalle/${request.iIdCotizacionDetalle}`;
        return this.http.delete<IApiResponse<ICotizacionDetalleDeleteResponse>>(url).pipe(
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