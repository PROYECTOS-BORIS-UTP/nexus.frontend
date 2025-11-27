import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IProveedorListadoRequest } from '../interfaces/request/IProveedorListadoRequest.interface';
import { IProveedorResponse } from '../interfaces/response/IProveedorResponse.interface';
import { IProveedorCreateUpdateRequest } from '../interfaces/request/IProveedorCreateUpdateRequest.interface';
import { IProveedorCreateUpdateResponse } from '../interfaces/response/IProveedorCreateUpdateResponse.interface';
import { IProveedorDeleteRequest } from '../interfaces/request/IProveedorDeleteRequest.interface';
import { IProveedorDeleteResponse } from '../interfaces/response/IProveedorDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class ProveedorService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/proveedor`;

    constructor() { }

    // #region Listado
    listarProveedores(request: IProveedorListadoRequest): Observable<IPaginationResponse<IProveedorResponse>> {
        const url = `${this.apiUrl}/ListadoProveedor`;
        return this.http.post<IApiResponse<IPaginationResponse<IProveedorResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener proveedores');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarProveedor(request: IProveedorCreateUpdateRequest): Observable<IProveedorCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarProveedor`;
        return this.http.post<IApiResponse<IProveedorCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el proveedor');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    eliminarProveedor(request: IProveedorDeleteRequest): Observable<IProveedorDeleteResponse> {
        const url = `${this.apiUrl}/EliminarProveedor/${request.iIdProveedor}`;
        return this.http.delete<IApiResponse<IProveedorDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el proveedor');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}