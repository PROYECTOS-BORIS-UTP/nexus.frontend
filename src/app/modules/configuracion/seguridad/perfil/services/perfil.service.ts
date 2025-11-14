import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { IPerfilOpcionCreateRequest } from '../interfaces/request/IPerfilOpcionCreateRequest.interface';
import { IPerfilOpcionCreateResponse } from '../interfaces/response/IPerfilOpcionCreateResponse.interface';
import { IPerfilOpcionListadoResponse } from '../interfaces/response/IPerfilOpcionListadoResponse.interface';


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
        const url = `${this.apiUrl}/CrearActualizarPerfil`;
        return this.http.post<IApiResponse<IPerfilCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response.aData;
                    } else {
                        throw new Error(response.vMessage || 'El backend indicó un error al crear/actualizar el perfil.');
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
        return this.http.delete<IApiResponse<IPerfilDeleteResponse>>(url).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response.aData;
                    } else {
                        throw new Error(response.vMessage || 'El backend indicó un error al eliminar el perfil.');
                    }
                } else {
                    console.error('Respuesta inesperada del backend:', response);
                    throw new Error('Respuesta inesperada del servidor al eliminar.');
                }
            }),
            catchError(handleHttpError)
        );
    }

    // #region Permisos (Opciones por Perfil) - NUEVOS MÉTODOS

    /*
    * Obtiene el árbol de opciones y permisos para un perfil.
    * @param iIdPerfil ID del perfil a consultar.
    */
    listarOpcionesPorPerfil(iIdPerfil: number): Observable<IPerfilOpcionListadoResponse[]> {
        const url = `${this.apiUrl}/ListarOpcionesPorPerfil/${iIdPerfil}`;
        return this.http.get<IApiResponse<IPerfilOpcionListadoResponse[]>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener permisos');
                }
            }),
            // 3. El catchError maneja errores HTTP (404, 500) o el error lanzado desde el map
            catchError(handleHttpError)
        );
    }

    /*
     * Guarda (Inserta/Actualiza) un permiso específico para un perfil.
     * @param request DTO con los datos del permiso.
     * @returns Observable con la respuesta de la operación.
     */
    guardarPermiso(request: IPerfilOpcionCreateRequest): Observable<IPerfilOpcionCreateResponse> {
        const url = `${this.apiUrl}/GuardarPermiso`;
        return this.http.post<IPerfilOpcionCreateResponse>(url, request).pipe(
            map(response => {
                if (response && response.bStatus) {
                    return response;
                } else {
                    throw new Error(response.vMensaje || 'Error al guardar el permiso.');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}