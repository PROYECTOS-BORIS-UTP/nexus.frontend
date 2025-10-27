import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IMonedaListadoRequest } from '../interfaces/request/IMonedaListadoRequest.interface';
import { IMonedaResponse } from '../interfaces/response/IMonedaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class MonedaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/moneda`; // URL base para Moneda

    constructor() { }

    /*
     * Obtiene la lista paginada de Monedas desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de monedas.
     */
    listarMonedas(request: IMonedaListadoRequest): Observable<IPaginationResponse<IMonedaResponse>> {
        const url = `${this.apiUrl}/ListadoMonedas`;
        return this.http.post<IApiResponse<IPaginationResponse<IMonedaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener monedas');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarMonedas:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar monedas';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}