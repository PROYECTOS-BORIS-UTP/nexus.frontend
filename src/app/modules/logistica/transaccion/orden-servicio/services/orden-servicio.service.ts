import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';

import { IOrdenServicioListadoRequest } from '../interfaces/request/IOrdenServicioListadoRequest.interface';
import { IOrdenServicioResponse } from '../interfaces/response/IOrdenServicioResponse.interface';
import { IOrdenServicioCreateUpdateRequest } from '../interfaces/request/IOrdenServicioCreateUpdateRequest.interface';
import { IOrdenServicioCreateUpdateResponse } from '../interfaces/response/IOrdenServicioCreateUpdateResponse.interface';
import { IOrdenServicioDeleteRequest } from '../interfaces/request/IOrdenServicioDeleteRequest.interface';
import { IOrdenServicioDeleteResponse } from '../interfaces/response/IOrdenServicioDeleteResponse.interface';
import { IOrdenServicioDetalleListadoRequest } from '../interfaces/request/IOrdenServicioDetalleListadoRequest.interface';
import { IOrdenServicioDetalleResponse } from '../interfaces/response/IOrdenServicioDetalleResponse.interface';
import { IOrdenServicioDetalleCreateUpdateRequest } from '../interfaces/request/IOrdenServicioDetalleCreateUpdateRequest.interface';
import { IOrdenServicioDetalleCreateUpdateResponse } from '../interfaces/response/IOrdenServicioDetalleCreateUpdateResponse.interface';
import { IOrdenServicioDetalleDeleteRequest } from '../interfaces/request/IOrdenServicioDetalleDeleteRequest.interface';
import { IOrdenServicioDetalleDeleteResponse } from '../interfaces/response/IOrdenServicioDetalleDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class OrdenServicioService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/orden-servicio`;

    // #region CABECERA

    /*
     * Listar órdenes de servicio con paginación y filtros
     */
    listarOrdenServicio(request: IOrdenServicioListadoRequest): Observable<IPaginationResponse<IOrdenServicioResponse>> {
        const url = `${this.apiUrl}/ListadoOrdenServicio`;
        return this.http.post<IApiResponse<IPaginationResponse<IOrdenServicioResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener órdenes de servicio');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Crear o actualizar una orden de servicio
     */
    crearActualizarOrdenServicio(request: IOrdenServicioCreateUpdateRequest): Observable<IOrdenServicioCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarOrdenServicio`;
        return this.http.post<IApiResponse<IOrdenServicioCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de orden de servicio');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Eliminar (baja lógica) una orden de servicio
     */
    eliminarOrdenServicio(request: IOrdenServicioDeleteRequest): Observable<IOrdenServicioDeleteResponse> {
        const url = `${this.apiUrl}/EliminarOrdenServicio/${request.iIdOrdenServicio}`;
        return this.http.delete<IApiResponse<IOrdenServicioDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar la orden de servicio');
                }
            }),
            catchError(handleHttpError)
        );
    }

    // #endregion

    // #region DETALLE

    /*
     * Listar detalles de una orden de servicio
     */
    listarOrdenServicioDetalle(request: IOrdenServicioDetalleListadoRequest): Observable<IOrdenServicioDetalleResponse[]> {
        const url = `${this.apiUrl}/ListadoOrdenServicioDetalle`;
        return this.http.post<IApiResponse<IOrdenServicioDetalleResponse[]>>(url, request).pipe(
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

    /*
     * Crear o actualizar un detalle de orden de servicio
     */
    crearActualizarOrdenServicioDetalle(request: IOrdenServicioDetalleCreateUpdateRequest): Observable<IOrdenServicioDetalleCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarOrdenServicioDetalle`;
        return this.http.post<IApiResponse<IOrdenServicioDetalleCreateUpdateResponse>>(url, request).pipe(
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

    /*
     * Eliminar físicamente un detalle de orden de servicio
     */
    eliminarOrdenServicioDetalle(request: IOrdenServicioDetalleDeleteRequest): Observable<IOrdenServicioDetalleDeleteResponse> {
        const url = `${this.apiUrl}/EliminarOrdenServicioDetalle/${request.iIdOrdenServicioDetalle}`;
        return this.http.delete<IApiResponse<IOrdenServicioDetalleDeleteResponse>>(url).pipe(
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
