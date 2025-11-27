import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { IProveedorContactoListadoRequest } from '../interfaces/request/IProveedorContactoListadoRequest.interface';
import { IProveedorContactoResponse } from '../interfaces/response/IProveedorContactoResponse.interface';
import { IProveedorContactoCreateUpdateRequest } from '../interfaces/request/IProveedorContactoCreateUpdateRequest.interface';
import { IProveedorContactoCreateUpdateResponse } from '../interfaces/response/IProveedorContactoCreateUpdateResponse.interface';
import { IProveedorContactoDeleteRequest } from '../interfaces/request/IProveedorContactoDeleteRequest.interface';
import { IProveedorContactoDeleteResponse } from '../interfaces/response/IProveedorContactoDeleteResponse.interface';
import { environment } from '../../../../../../../../../../environments/environments';
import { IApiResponse } from '../../../../../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../../../../../core/utils/error-handler.utils';

@Injectable({
    providedIn: 'root'
})
export class ProveedorContactoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/proveedor-contacto`;

    constructor() { }

    // #region Listado
    listarContactos(request: IProveedorContactoListadoRequest): Observable<IPaginationResponse<IProveedorContactoResponse>> {
        const url = `${this.apiUrl}/ListadoProveedorContacto`;
        return this.http.post<IApiResponse<IPaginationResponse<IProveedorContactoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener contactos');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarContacto(request: IProveedorContactoCreateUpdateRequest): Observable<IProveedorContactoCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarProveedorContacto`;
        return this.http.post<IApiResponse<IProveedorContactoCreateUpdateResponse>>(url, request).pipe(
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
    eliminarContacto(request: IProveedorContactoDeleteRequest): Observable<IProveedorContactoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarProveedorContacto/${request.iIdContacto}`;
        return this.http.delete<IApiResponse<IProveedorContactoDeleteResponse>>(url).pipe(
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
