import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { IMovimientoCreateRequest } from '../interfaces/request/IMovimientoCreateRequest.interface';
import { IMovimientoCreateResponse } from '../interfaces/response/IMovimientoCreateResponse.interface';
import { IMovimientoAnularResponse } from '../interfaces/response/IMovimientoAnularResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IMovimientoListadoRequest } from '../interfaces/request/IMovimientoListadoRequest.interface';
import { IMovimientoResponse } from '../interfaces/response/IMovimientoResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class MovimientosService {

    private http = inject(HttpClient);
    private snackBar = inject(MatSnackBar);
    private apiUrl = `${environment.UrlBase}/movimientos`; // Asumiendo 'movimientos' como ruta base

    // #region Listado
    /*
     * Obtiene la lista paginada de Movimientos (Kardex).
     */
    listarMovimientos(request: IMovimientoListadoRequest): Observable<IPaginationResponse<IMovimientoResponse>> {
        const url = `${this.apiUrl}/ListadoMovimientos`;
        return this.http.post<IApiResponse<IPaginationResponse<IMovimientoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener movimientos');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear
    /*
     * Registra un nuevo Movimiento y afecta el Stock.
     * @param request DTO con los datos del movimiento.
     * @returns Observable con la respuesta de la operación.
     */
    crearMovimiento(request: IMovimientoCreateRequest): Observable<IMovimientoCreateResponse> {
        const url = `${this.apiUrl}/CrearMovimiento`;
        return this.http.post<IApiResponse<IMovimientoCreateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de movimiento');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Anular (Eliminar)
    /*
     * Anula un Movimiento y revierte el Stock.
     * @param iIdMovimiento ID del movimiento a anular.
     * @returns Observable con la respuesta de la operación.
     */
    anularMovimiento(iIdMovimiento: number): Observable<IMovimientoAnularResponse> {
        const url = `${this.apiUrl}/AnularMovimiento/${iIdMovimiento}`;
        return this.http.delete<IApiResponse<IMovimientoAnularResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al anular el movimiento');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}