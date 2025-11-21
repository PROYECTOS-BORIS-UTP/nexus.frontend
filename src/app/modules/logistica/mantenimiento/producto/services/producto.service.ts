import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IProductoListadoRequest } from '../interfaces/request/IProductoListadoRequest.interface';
import { IProductoResponse } from '../interfaces/response/IProductoResponse.interface';
import { IProductoCreateUpdateRequest } from '../interfaces/request/IProductoCreateUpdateRequest.interface';
import { IProductoCreateUpdateResponse } from '../interfaces/response/IProductoCreateUpdateResponse.interface';
import { IProductoDeleteRequest } from '../interfaces/request/IProductoDeleteRequest.interface';
import { IProductoDeleteResponse } from '../interfaces/response/IProductoDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/producto`;

    constructor() { }

    // #region Listado
    listarProductos(request: IProductoListadoRequest): Observable<IPaginationResponse<IProductoResponse>> {
        const url = `${this.apiUrl}/ListadoProducto`;
        return this.http.post<IApiResponse<IPaginationResponse<IProductoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener productos');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarProducto(request: IProductoCreateUpdateRequest): Observable<IProductoCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarProducto`;
        return this.http.post<IApiResponse<IProductoCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el producto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    eliminarProducto(request: IProductoDeleteRequest): Observable<IProductoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarProducto/${request.iIdProducto}`;
        return this.http.delete<IApiResponse<IProductoDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el producto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}