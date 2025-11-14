import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

import { IAlmacenResponse } from '../interfaces/response/IAlmacenResponse.interface';
import { IAlmacenListadoRequest } from '../interfaces/request/IAlmacenListadoRequest.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IAlmacenCreateUpdateRequest } from '../interfaces/request/IAlmacenCreateUpdateRequest.interface';
import { IAlmacenCreateUpdateResponse } from '../interfaces/response/IAlmacenCreateUpdateResponse.interface';
import { IAlmacenDeleteResponse } from '../interfaces/response/IAlmacenDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class AlmacenService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/almacen`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Almacenes desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de almacenes.
     */
    listarAlmacenes(request: IAlmacenListadoRequest): Observable<IPaginationResponse<IAlmacenResponse>> {
        const url = `${this.apiUrl}/ListadoAlmacen`;
        return this.http.post<IApiResponse<IPaginationResponse<IAlmacenResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener almacenes');
                }
            }),
            catchError(handleHttpError)
        );
    }

    // #region Crear/Actualizar
    /*
     * Crea o actualiza un Almacén.
     * @param request DTO con los datos del almacén.
     * @returns Observable con la respuesta de la operación.
     */
    crearActualizarAlmacen(request: IAlmacenCreateUpdateRequest): Observable<IAlmacenCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarAlmacen`;
        return this.http.post<IApiResponse<IAlmacenCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error en la operación de almacén');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar (Baja Lógica)
    /*
     * Realiza la baja lógica de un Almacén.
     * @param iIdAlmacen ID del almacén a eliminar.
     * @returns Observable con la respuesta de la operación.
     */
    eliminarAlmacen(iIdAlmacen: number): Observable<IAlmacenDeleteResponse> {
        const url = `${this.apiUrl}/EliminarAlmacen/${iIdAlmacen}`;
        return this.http.delete<IApiResponse<IAlmacenDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el almacén');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}