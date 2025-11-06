import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { IOpcionListadoRequest } from '../interfaces/request/IOpcionListadoRequest.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IOpcionListadoResponse } from '../interfaces/response/IOpcionListadoResponse.interface';
import { IOpcionCreateUpdateRequest } from '../interfaces/request/IOpcionCreateUpdateRequest.interface';
import { IOpcionCreateUpdateResponse } from '../interfaces/response/IOpcionCreateUpdateResponse.interface';
import { IOpcionDeleteResponse } from '../interfaces/response/IOpcionDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class OpcionService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/opcion`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Opciones desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de opciones.
     */
    listarOpciones(request: IOpcionListadoRequest): Observable<IPaginationResponse<IOpcionListadoResponse>> {
        const url = `${this.apiUrl}/ListadoOpciones`;
        return this.http.post<IApiResponse<IPaginationResponse<IOpcionListadoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener opciones');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Crea o actualiza una opción del sistema.
     * @param request DTO con los datos de la opción.
     * @returns Un Observable con la respuesta de la operación.
     */
    crearActualizarOpcion(request: IOpcionCreateUpdateRequest): Observable<IOpcionCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarOpcion`;
        return this.http.post<IOpcionCreateUpdateResponse>(url, request).pipe(
            map(response => {
                if (response.bStatus) {
                    return response;
                } else {
                    throw new Error(response.vMensaje || 'Error al procesar la solicitud');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
     * Elimina (lógicamente) una opción del sistema.
     * @param iIdOpcion ID de la opción a eliminar.
     * @returns Un Observable con la respuesta de la operación.
     */
    eliminarOpcion(iIdOpcion: number): Observable<IOpcionDeleteResponse> {
        const url = `${this.apiUrl}/EliminarOpcion/${iIdOpcion}`;
        return this.http.delete<IOpcionDeleteResponse>(url).pipe(
            map(response => {
                if (response.bStatus) {
                    return response;
                } else {
                    throw new Error(response.vMensaje || 'Error al eliminar la opción');
                }
            }),
            catchError(handleHttpError)
        );
    }
}