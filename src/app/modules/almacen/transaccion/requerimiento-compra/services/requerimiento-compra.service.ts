import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IRequerimientoCompraListadoRequest } from '../interfaces/request/IRequerimientoCompraListadoRequest.interface';
import { IRequerimientoCompraListadoResponse } from '../interfaces/response/IRequerimientoCompraListadoResponse.interface';
import { IRequerimientoCompraCreateUpdateRequest } from '../interfaces/request/IRequerimientoCompraCreateUpdateRequest.interface';
import { IRequerimientoCompraCreateUpdateResponse } from '../interfaces/response/IRequerimientoCompraCreateUpdateResponse.interface';
import { IRequerimientoCompraDeleteResponse } from '../interfaces/response/IRequerimientoCompraDeleteResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IRequerimientoCompraDetalleCreateUpdateRequest } from '../interfaces/request/IRequerimientoCompraDetalleCreateUpdateRequest';
import { IRequerimientoCompraDetalleListadoRequest } from '../interfaces/request/IRequerimientoCompraDetalleListadoRequest.interface';
import { IRequerimientoCompraDetalleCreateUpdateResponse } from '../interfaces/response/IRequerimientoCompraDetalleCreateUpdateResponse.interface';
import { IRequerimientoCompraDetalleDeleteResponse } from '../interfaces/response/IRequerimientoCompraDetalleDeleteResponse.interface';
import { IRequerimientoCompraDetalleListadoResponse } from '../interfaces/response/IRequerimientoCompraDetalleListadoResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class RequerimientoCompraService {

    private http = inject(HttpClient);
    private snackBar = inject(MatSnackBar);
    private apiUrl = `${environment.UrlBase}/requerimiento-compra`;

    // #region Listado
    /*
     * Obtiene la lista paginada de Requerimientos de Compra.
     */
    listarRequerimientosCompra(request: IRequerimientoCompraListadoRequest): Observable<IPaginationResponse<IRequerimientoCompraListadoResponse>> {
        const url = `${this.apiUrl}/ListadoRequerimientosCompra`;
        return this.http.post<IApiResponse<IPaginationResponse<IRequerimientoCompraListadoResponse>>>(url, request).pipe(
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
    /*
     * Crea o actualiza un Requerimiento de Compra.
     * @param request DTO con los datos del requerimiento.
     * @returns Observable con la respuesta de la operación.
     */
    crearActualizarRequerimientoCompra(request: IRequerimientoCompraCreateUpdateRequest): Observable<IRequerimientoCompraCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarRequerimientoCompra`;
        return this.http.post<IApiResponse<IRequerimientoCompraCreateUpdateResponse>>(url, request).pipe(
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
    /*
     * Realiza la anulación de un Requerimiento de Compra.
     * @param iIdRequerimientoCompra ID del requerimiento a anular.
     * @returns Observable con la respuesta de la operación.
     */
    anularRequerimientoCompra(iIdRequerimientoCompra: number): Observable<IRequerimientoCompraDeleteResponse> {
        const url = `${this.apiUrl}/AnularRequerimientoCompra/${iIdRequerimientoCompra}`;
        return this.http.delete<IApiResponse<IRequerimientoCompraDeleteResponse>>(url).pipe(
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
    listarDetallesRequerimientoCompra(request: IRequerimientoCompraDetalleListadoRequest): Observable<IPaginationResponse<IRequerimientoCompraDetalleListadoResponse>> {
        const url = `${this.apiUrl}/ListadoDetalle`;
        return this.http.post<IApiResponse<IPaginationResponse<IRequerimientoCompraDetalleListadoResponse>>>(url, request).pipe(
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
    crearActualizarDetalleRequerimientoCompra(request: IRequerimientoCompraDetalleCreateUpdateRequest): Observable<IRequerimientoCompraDetalleCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarDetalle`;
        return this.http.post<IApiResponse<IRequerimientoCompraDetalleCreateUpdateResponse>>(url, request).pipe(
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
    eliminarDetalleRequerimientoCompra(iIdRequerimientoCompraDetalle: number): Observable<IRequerimientoCompraDetalleDeleteResponse> {
        const url = `${this.apiUrl}/EliminarDetalle/${iIdRequerimientoCompraDetalle}`;
        return this.http.delete<IApiResponse<IRequerimientoCompraDetalleDeleteResponse>>(url).pipe(
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