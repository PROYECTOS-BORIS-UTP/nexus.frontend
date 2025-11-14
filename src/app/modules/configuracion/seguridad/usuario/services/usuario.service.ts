import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IUsuarioListadoRequest } from '../interfaces/request/IUsuarioListadoRequest.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IUsuarioResponse } from '../interfaces/response/IUsuarioResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IUsuarioCreateUpdateRequest } from '../interfaces/request/IUsuarioCreateUpdateRequest.interface';
import { IUsuarioCreateUpdateResponse } from '../interfaces/response/IUsuarioCreateUpdateResponse.interface';
import { IUsuarioDeleteResponse } from '../interfaces/response/IUsuarioDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/usuario`;

    constructor() { }

    /*
     * Obtiene la lista paginada de usuarios desde el backend.
     * Espera una respuesta envuelta en IApiResponse que contiene IPaginationResponse.
     * @param request DTO con los parámetros de paginación y filtros (IUsuarioListadoRequest).
     * @returns Un Observable con la respuesta paginada (IPaginationResponse desde core).
     */
    listarUsuarios(request: IUsuarioListadoRequest): Observable<IPaginationResponse<IUsuarioResponse>> { // Usa IPaginationResponse del core
        const url = `${this.apiUrl}/ListadoUsuario`;
        return this.http.post<IApiResponse<IPaginationResponse<IUsuarioResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener usuarios');
                }
            }),
            catchError(handleHttpError)
        );
    }

     /*
         * Envía una solicitud para crear o actualizar una Usuario.
         * @param request DTO con los datos de la usuario.
         * @returns Un Observable con la respuesta del backend.
         */
        crearActualizarUsario(request: IUsuarioCreateUpdateRequest): Observable<IUsuarioCreateUpdateResponse> {
            const url = `${this.apiUrl}/CrearActualizarUsuario`;
            return this.http.post<IUsuarioCreateUpdateResponse>(url, request).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response;
                        } else {
                            throw new Error(response.vMensaje || 'El backend indicó un error al crear/actualizar la compañia.');
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
         * Envía una solicitud para eliminar (baja lógica) un usuario.
         * @param iIdCompania ID del usuario a eliminar.
         * @returns Un Observable con la respuesta del backend.
         */
        eliminarUsuario(iIdUsuario: number): Observable<IUsuarioDeleteResponse> {
            const url = `${this.apiUrl}/EliminarUsuario/${iIdUsuario}`;
            return this.http.delete<IUsuarioDeleteResponse>(url).pipe(
                map(response => {
                    if (response && typeof response.bStatus === 'boolean') {
                        if (response.bStatus) {
                            return response;
                        } else {
                            throw new Error(response.vMensaje || 'El backend indicó un error al eliminar el usuario.');
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