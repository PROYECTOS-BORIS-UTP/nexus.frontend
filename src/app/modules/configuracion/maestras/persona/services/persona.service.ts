import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { IPersonaListadoRequest } from '../interfaces/request/IPersonaListadoRequest.interface';
import { IPersonaResponse } from '../interfaces/response/IPersonaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPersonaCreateUpdateRequest } from '../interfaces/request/IPersonaCreateUpdateRequest.interface';
import { IPersonaCreateUpdateResponse } from '../interfaces/response/IPersonaCreateUpdateResponse.interface';
import { IPersonaDeleteResponse } from '../interfaces/response/IPersonaDeleteResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';

@Injectable({
    providedIn: 'root'
})
export class PersonaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/persona`;

    constructor() { }

    /*
     * Obtiene la lista paginada de personas desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de personas.
     */
    listarPersonas(request: IPersonaListadoRequest): Observable<IPaginationResponse<IPersonaResponse>> {
        const url = `${this.apiUrl}/ListadoPersonas`;
        return this.http.post<IApiResponse<IPaginationResponse<IPersonaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener personas');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
    * Envía una solicitud para crear o actualizar una persona.
    * @param request DTO con los datos de la persona a crear o actualizar.
    * @returns Un Observable con la respuesta del backend (incluyendo el ID y mensaje).
    */
    crearActualizarPersona(request: IPersonaCreateUpdateRequest): Observable<IPersonaCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarPersona`;
        return this.http.post<IPersonaCreateUpdateResponse>(url, request).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response;
                    } else {
                        throw new Error(response.vMensaje || 'El backend indicó un error al crear/actualizar la persona.');
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
     * Envía una solicitud para eliminar(baja lógica) una persona.
     * @param iIdPersona ID de la persona a eliminar.
     * @returns Un Observable con la respuesta del backend.
     */
    eliminarPersona(iIdPersona: number): Observable<IPersonaDeleteResponse> {
        const url = `${this.apiUrl}/EliminarPersona/${iIdPersona}`;
        return this.http.delete<IPersonaDeleteResponse>(url).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response;
                    } else {
                        throw new Error(response.vMensaje || 'El backend indicó un error al eliminar la persona.');
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