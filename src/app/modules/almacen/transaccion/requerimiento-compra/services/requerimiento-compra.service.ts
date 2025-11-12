// src/app/modules/logistica/requerimiento-compra/services/requerimiento-compra.service.ts

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
}