import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IPerfilListadoRequest } from '../interfaces/request/IPerfilListadoRequest.interface';
import { IPerfilResponse } from '../interfaces/response/IPerfilResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IPerfilCreateUpdateRequest } from '../interfaces/request/IPerfilCreateUpdateRequest.interface';
import { IPerfilCreateUpdateResponse } from '../interfaces/response/IPerfilCreateUpdateResponse.interface';
import { IPerfilDeleteResponse } from '../interfaces/response/IPerfilDeleteResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class PerfilService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/perfil`;

    constructor() { }

    /*
     * Obtiene la lista paginada de perfiles desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de perfiles.
     */
    listarPerfiles(request: IPerfilListadoRequest): Observable<IPaginationResponse<IPerfilResponse>> {
        const url = `${this.apiUrl}/ListadoPerfil`;
        return this.http.post<IApiResponse<IPaginationResponse<IPerfilResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener perfiles');
                }
            }),
            catchError(handleHttpError)
        );
    }


    /*
        * Envía una solicitud para crear o actualizar un Perfil.
        * @param request DTO con los datos del perfil.
        * @returns Un Observable con la respuesta del backend.
        */
        crearActualizarPerfil(request: IPerfilCreateUpdateRequest): Observable<IPerfilCreateUpdateResponse> {
            const url = `${this.apiUrl}/Crear o actualizar un perfil`;
            return this.http.post<IPerfilCreateUpdateResponse>(url, request).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response;
                        } else {
                            throw new Error(response.vMensaje || 'El backend indicó un error al crear/actualizar el perfil.');
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
         * Envía una solicitud para eliminar (baja lógica) un Perfil.
         * @param iIdPerfil ID del perfil a eliminar.
         * @returns Un Observable con la respuesta del backend.
         */
        eliminarPerfil(iIdPerfil: number): Observable<IPerfilDeleteResponse> {
            const url = `${this.apiUrl}/EliminarPerfil/${iIdPerfil}`;
            return this.http.delete<IPerfilDeleteResponse>(url).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response;
                        } else {
                            throw new Error(response.vMensaje || 'El backend indicó un error al eliminar el perfil.');
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