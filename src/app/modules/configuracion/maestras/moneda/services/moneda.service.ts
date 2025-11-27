import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IMonedaListadoRequest } from '../interfaces/request/IMonedaListadoRequest.interface';
import { IMonedaResponse } from '../interfaces/response/IMonedaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IMonedaCreateUpdateRequest } from '../interfaces/request/IMonedaCreateUpdateRequest.interface';
import { IMonedaCreateUpdateResponse } from '../interfaces/response/IMonedaCreateUpdateResponse.interface';
import { IMonedaDeleteResponse } from '../interfaces/response/IMonedaDeleteResponse.interface';


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

    /*
         * Envía una solicitud para crear o actualizar una Moneda.
         * @param request DTO con los datos de la moneda.
         * @returns Un Observable con la respuesta del backend.
         */
        crearActualizarMoneda(request: IMonedaCreateUpdateRequest): Observable<IMonedaCreateUpdateResponse> {
            const url = `${this.apiUrl}/CrearActualizarMoneda`;
            return this.http.post<IApiResponse<IMonedaCreateUpdateResponse>>(url, request).pipe(
                map(response => {                
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response.aData;
                        } else {
                            throw new Error(response.vMessage || 'El backend indicó un error al crear/actualizar la moneda.');
                        }
                    } else {
                        console.error('Respuesta inesperada del backend:', response);
                        throw new Error('Respuesta inesperada del servidor al crear/actualizar.');
                    }
                }),
                catchError(handleHttpError)
            );
        }
    
        /*
         * Envía una solicitud para eliminar (baja lógica) una moneda.
         * @param iIdCompania ID de la moneda a eliminar.
         * @returns Un Observable con la respuesta del backend.
         */
        eliminarMoneda(iIdMoneda: number): Observable<IMonedaDeleteResponse> {
            const url = `${this.apiUrl}/EliminarMoneda/${iIdMoneda}`;
            return this.http.delete<IApiResponse<IMonedaDeleteResponse>>(url).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response.aData;
                        } else {
                            throw new Error(response.vMessage || 'El backend indicó un error al eliminar la moneda.');
                        }
                    } else {
                        console.error('Respuesta inesperada del backend:', response);
                        throw new Error('Respuesta inesperada del servidor al eliminar.');
                    }
                }),
                catchError(handleHttpError)
            );
        }
}