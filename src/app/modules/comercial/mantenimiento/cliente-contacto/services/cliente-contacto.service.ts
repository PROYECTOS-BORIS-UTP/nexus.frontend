import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { IClienteContactoListadoRequest } from '../interfaces/request/IClienteContactoListadoRequest.interface';
import { IClienteContactoResponse } from '../interfaces/response/IClienteContactoResponse.interface';
import { IClienteContactoCreateUpdateRequest } from '../interfaces/request/IClienteContactoCreateUpdateRequest.interface';
import { IClienteContactoCreateUpdateResponse } from '../interfaces/response/IClienteContactoCreateUpdateResponse.interface';
import { IClienteContactoDeleteRequest } from '../interfaces/request/IClienteContactoDeleteRequest.interface';
import { IClienteContactoDeleteResponse } from '../interfaces/response/IClienteContactoDeleteResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';

@Injectable({
    providedIn: 'root'
})
export class ClienteContactoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/cliente-contacto`;

    constructor() { }

    // #region Listado
    ListadoClienteContacto(request: IClienteContactoListadoRequest): Observable<IPaginationResponse<IClienteContactoResponse>> {
        const url = `${this.apiUrl}/ListadoClienteContacto`;
        return this.http.post<IApiResponse<IPaginationResponse<IClienteContactoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener contactos del cliente');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    CrearActualizarClienteContacto(request: IClienteContactoCreateUpdateRequest): Observable<IClienteContactoCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarClienteContacto`;
        return this.http.post<IApiResponse<IClienteContactoCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el contacto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    EliminarClienteContacto(request: IClienteContactoDeleteRequest): Observable<IClienteContactoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarClienteContacto/${request.iIdClienteContacto}`;
        return this.http.delete<IApiResponse<IClienteContactoDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el contacto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}