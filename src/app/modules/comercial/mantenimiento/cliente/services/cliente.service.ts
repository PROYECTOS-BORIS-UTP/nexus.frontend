import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IClienteListadoRequest } from '../interfaces/request/IClienteListadoRequest.interface';
import { IClienteResponse } from '../interfaces/response/IClienteResponse.interface';
import { IClienteCreateUpdateRequest } from '../interfaces/request/IClienteCreateUpdateRequest.interface';
import { IClienteCreateUpdateResponse } from '../interfaces/response/IClienteCreateUpdateResponse.interface';
import { IClienteDeleteRequest } from '../interfaces/request/IClienteDeleteRequest.interface';
import { IClienteDeleteResponse } from '../interfaces/response/IClienteDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/cliente`;

    constructor() { }

    // #region Listado
    ListadoCliente(request: IClienteListadoRequest): Observable<IPaginationResponse<IClienteResponse>> {
        const url = `${this.apiUrl}/ListadoCliente`;
        return this.http.post<IApiResponse<IPaginationResponse<IClienteResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener clientes');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    CrearActualizarCliente(request: IClienteCreateUpdateRequest): Observable<IClienteCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarCliente`;
        return this.http.post<IApiResponse<IClienteCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el cliente');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    EliminarCliente(request: IClienteDeleteRequest): Observable<IClienteDeleteResponse> {
        const url = `${this.apiUrl}/EliminarCliente/${request.iIdCliente}`;
        return this.http.delete<IApiResponse<IClienteDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el cliente');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}
