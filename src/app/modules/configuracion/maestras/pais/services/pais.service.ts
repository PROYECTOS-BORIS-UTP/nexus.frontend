import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IPaisListadoRequest } from '../interfaces/request/IPaisListadoRequest.interface';
import { IPaisResponse } from '../interfaces/response/IPaisResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IPaisCreateUpdateResponse } from '../interfaces/response/IPaisCreateUpdateResponse.interface';
import { IPaisCreateUpdateRequest } from '../interfaces/request/IPaisCreateUpdateRequest.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IPaisDeleteResponse } from '../interfaces/response/IPaisDeleteResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class PaisService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/pais`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Países desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de países.
     */
    listarPaises(request: IPaisListadoRequest): Observable<IPaginationResponse<IPaisResponse>> {
        const url = `${this.apiUrl}/ListadoPaises`;
        return this.http.post<IApiResponse<IPaginationResponse<IPaisResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener países');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
         * Envía una solicitud para crear o actualizar una Pais.
         * @param request DTO con los datos de la Pais.
         * @returns Un Observable con la respuesta del backend.
         */
        crearActualizarCompania(request: IPaisCreateUpdateRequest): Observable<IPaisCreateUpdateResponse> {
            const url = `${this.apiUrl}/CrearActualizarPais`;
            return this.http.post<IApiResponse<IPaisCreateUpdateResponse>>(url, request).pipe(
                map(response => {                
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response.aData;
                        } else {
                            throw new Error(response.vMessage || 'El backend indicó un error al crear/actualizar la Pais.');
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
         * Envía una solicitud para eliminar (baja lógica) una Pais.
         * @param iIdPais ID de la Pais a eliminar.
         * @returns Un Observable con la respuesta del backend.
         */
        eliminarPais(iIdPais: number): Observable<IPaisDeleteResponse> {
            const url = `${this.apiUrl}/EliminarPais/${iIdPais}`;
            return this.http.delete<IApiResponse<IPaisDeleteResponse>>(url).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response.aData;
                        } else {
                            throw new Error(response.vMessage || 'El backend indicó un error al eliminar la Pais.');
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