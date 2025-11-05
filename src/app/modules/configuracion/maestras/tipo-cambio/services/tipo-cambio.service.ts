import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ITipoCambioListadoRequest } from '../interfaces/request/ITipoCambioListadoRequest.interface';
import { ITipoCambioResponse } from '../interfaces/response/ITipoCambioResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class TipoCambioService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/tipo-cambio`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Tipos de Cambio desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de tipos de cambio.
     */
    listarTiposCambio(request: ITipoCambioListadoRequest): Observable<IPaginationResponse<ITipoCambioResponse>> {
        const url = `${this.apiUrl}/ListadoTipoCambio`; // Endpoint específico
        return this.http.post<IApiResponse<IPaginationResponse<ITipoCambioResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener tipos de cambio');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarTiposCambio:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar tipos de cambio';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}