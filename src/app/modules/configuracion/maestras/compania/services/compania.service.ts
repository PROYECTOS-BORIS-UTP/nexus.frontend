import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ICompaniaListadoRequest } from '../interfaces/request/ICompaniaListadoRequest.interface';
import { ICompaniaResponse } from '../interfaces/response/ICompaniaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { ICompaniaCreateUpdateRequest } from '../interfaces/request/ICompaniaCreateUpdateRequest.interface';
import { ICompaniaCreateUpdateResponse } from '../interfaces/response/ICompaniaCreateUpdateResponse.interface';
import { ICompaniaDeleteResponse } from '../interfaces/response/ICompaniaDeleteResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class CompaniaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/compania`;

    constructor() { }

    /*
     * Obtiene la lista paginada de compañías desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de compañías.
     */
    listarCompanias(request: ICompaniaListadoRequest): Observable<IPaginationResponse<ICompaniaResponse>> {
        const url = `${this.apiUrl}/ListadoCompanias`;
        return this.http.post<IApiResponse<IPaginationResponse<ICompaniaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener compañías');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Envía una solicitud para crear o actualizar una Compañia.
     * @param request DTO con los datos de la compañia.
     * @returns Un Observable con la respuesta del backend.
     */
    crearActualizarCompania(request: ICompaniaCreateUpdateRequest): Observable<ICompaniaCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarCompania`;
        return this.http.post<IApiResponse<ICompaniaCreateUpdateResponse>>(url, request).pipe(
            map(response => {                
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response.aData;
                    } else {
                        throw new Error(response.vMessage || 'El backend indicó un error al crear/actualizar la compañia.');
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
     * Envía una solicitud para eliminar (baja lógica) una compañia.
     * @param iIdCompania ID de la compañia a eliminar.
     * @returns Un Observable con la respuesta del backend.
     */
    eliminarCompania(iIdCompania: number): Observable<ICompaniaDeleteResponse> {
        const url = `${this.apiUrl}/EliminarCompania/${iIdCompania}`;
        return this.http.delete<IApiResponse<ICompaniaDeleteResponse>>(url).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response.aData;
                    } else {
                        throw new Error(response.vMessage || 'El backend indicó un error al eliminar la compañia.');
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