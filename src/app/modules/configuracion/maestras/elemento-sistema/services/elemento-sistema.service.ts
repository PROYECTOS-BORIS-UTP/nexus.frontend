import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { IElementoSistemaListadoRequest } from '../interfaces/request/IElementoSistemaListadoRequest.interface';
import { IElementoSistemaResponse } from '../interfaces/response/IElementoSistemaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IElementoSistemaCreateUpdateRequest } from '../interfaces/request/IElementoSistemaCreateUpdateRequest.interface';
import { IElementoSistemaCreateUpdateResponse } from '../interfaces/response/IElementoSistemaCreateUpdateResponse.interface';
import { IElementoSistemaDeleteResponse } from '../interfaces/response/IElementoSistemaDeleteResponse.interface';
import { IElementoSistemaListadoPorCodigoRequest } from '../interfaces/request/IElementoSistemaListadoPorCodigoRequest.interface';
import { ISelectItem } from '../../../../../core/interfaces/ISelectItem.interface';


@Injectable({
    providedIn: 'root'
})
export class ElementoSistemaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/elemento-sistema`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Elementos del Sistema desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de elementos.
     */
    listarElementosSistema(request: IElementoSistemaListadoRequest): Observable<IPaginationResponse<IElementoSistemaResponse>> {
        const url = `${this.apiUrl}/ListadoElementosSistema`;
        return this.http.post<IApiResponse<IPaginationResponse<IElementoSistemaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener elementos del sistema');
                }
            }),
            catchError(handleHttpError)
        );
    }


    /*
    * Obtiene la lista de elementos hijos activos por código padre.
    * Mapea la respuesta al formato ISelectItem para usar en selects.
    * @param request DTO con el vCodigoPadre.
    * @returns Observable con un array de ISelectItem.
    */
    listarPorCodigoPadre(request: IElementoSistemaListadoPorCodigoRequest): Observable<ISelectItem[]> {
        const url = `${this.apiUrl}/ListarPorCodigoPadre`;
        return this.http.post<IApiResponse<ISelectItem[]>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener elementos del sistema');
                }
            }),
            catchError(handleHttpError)
        );
    }

    /*
    * Envía una solicitud para crear o actualizar un Elemento del Sistema.
    * @param request DTO con los datos del elemento.
    * @returns Un Observable con la respuesta del backend.
    */
    crearActualizarElementoSistema(request: IElementoSistemaCreateUpdateRequest): Observable<IElementoSistemaCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarElementoSistema`;
        return this.http.post<IElementoSistemaCreateUpdateResponse>(url, request).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response;
                    } else {
                        throw new Error(response.vMensaje || 'El backend indicó un error al crear/actualizar el elemento.');
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
     * Envía una solicitud para eliminar (baja lógica) un Elemento del Sistema.
     * @param iIdElemento ID del elemento a eliminar.
     * @returns Un Observable con la respuesta del backend.
     */
    eliminarElementoSistema(iIdElemento: number): Observable<IElementoSistemaDeleteResponse> {
        const url = `${this.apiUrl}/EliminarElementoSistema/${iIdElemento}`;
        return this.http.delete<IElementoSistemaDeleteResponse>(url).pipe(
            map(response => {
                if (response && typeof response.bStatus === 'boolean') {
                    if (response.bStatus) {
                        return response;
                    } else {
                        throw new Error(response.vMensaje || 'El backend indicó un error al eliminar el elemento.');
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