import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';

import { IOrdenCompraListadoRequest } from '../interfaces/request/IOrdenCompraListadoRequest.interface';
import { IOrdenCompraResponse } from '../interfaces/response/IOrdenCompraResponse.interface';
import { IOrdenCompraCreateUpdateRequest } from '../interfaces/request/IOrdenCompraCreateUpdateRequest.interface';
import { IOrdenCompraCreateUpdateResponse } from '../interfaces/response/IOrdenCompraCreateUpdateResponse.interface';
import { IOrdenCompraDeleteRequest } from '../interfaces/request/IOrdenCompraDeleteRequest.interface';
import { IOrdenCompraDeleteResponse } from '../interfaces/response/IOrdenCompraDeleteResponse.interface';
import { IOrdenCompraDetalleListadoRequest } from '../interfaces/request/IOrdenCompraDetalleListadoRequest.interface';
import { IOrdenCompraDetalleResponse } from '../interfaces/response/IOrdenCompraDetalleResponse.interface';
import { IOrdenCompraDetalleCreateUpdateRequest } from '../interfaces/request/IOrdenCompraDetalleCreateUpdateRequest.interface';
import { IOrdenCompraDetalleCreateUpdateResponse } from '../interfaces/response/IOrdenCompraDetalleCreateUpdateResponse.interface';
import { IOrdenCompraDetalleDeleteRequest } from '../interfaces/request/IOrdenCompraDetalleDeleteRequest.interface';
import { IOrdenCompraDetalleDeleteResponse } from '../interfaces/response/IOrdenCompraDetalleDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class OrdenCompraService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/orden-compra`;

    // #region CABECERA

    /*
     * Listar órdenes de compra con paginación y filtros
     */
    listarOrdenCompra(request: IOrdenCompraListadoRequest): Observable<IPaginationResponse<IOrdenCompraResponse>> {
        const url = `${this.apiUrl}/ListadoOrdenCompra`;
        return this.http.post<IApiResponse<IPaginationResponse<IOrdenCompraResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener órdenes de compra');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Crear o actualizar una orden de compra
     */
    crearActualizarOrdenCompra(request: IOrdenCompraCreateUpdateRequest): Observable<IOrdenCompraCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarOrdenCompra`;
        return this.http.post<IApiResponse<IOrdenCompraCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de orden de compra');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Eliminar (baja lógica) una orden de compra
     */
    eliminarOrdenCompra(request: IOrdenCompraDeleteRequest): Observable<IOrdenCompraDeleteResponse> {
        const url = `${this.apiUrl}/EliminarOrdenCompra/${request.iIdOrdenCompra}`;
        return this.http.delete<IApiResponse<IOrdenCompraDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar la orden de compra');
                }
            }),
            catchError(handleHttpError)
        );
    }

    // #endregion

    // #region DETALLE

    /*
     * Listar detalles de una orden de compra
     */
    listarOrdenCompraDetalle(request: IOrdenCompraDetalleListadoRequest): Observable<IPaginationResponse<IOrdenCompraDetalleResponse>> {
        const url = `${this.apiUrl}/ListadoOrdenCompraDetalle`;
        return this.http.post<IApiResponse<IPaginationResponse<IOrdenCompraDetalleResponse>>>(url, request).pipe(
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
     * Crear o actualizar un detalle de orden de compra
     */
    crearActualizarOrdenCompraDetalle(request: IOrdenCompraDetalleCreateUpdateRequest): Observable<IOrdenCompraDetalleCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarOrdenCompraDetalle`;
        return this.http.post<IApiResponse<IOrdenCompraDetalleCreateUpdateResponse>>(url, request).pipe(
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
     * Eliminar físicamente un detalle de orden de compra
     */
    eliminarOrdenCompraDetalle(request: IOrdenCompraDetalleDeleteRequest): Observable<IOrdenCompraDetalleDeleteResponse> {
        const url = `${this.apiUrl}/EliminarOrdenCompraDetalle/${request.iIdOrdenCompraDetalle}`;
        return this.http.delete<IApiResponse<IOrdenCompraDetalleDeleteResponse>>(url).pipe(
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
