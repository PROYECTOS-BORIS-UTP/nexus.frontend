import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IStockProductoListadoRequest } from '../interfaces/request/IStockProductoListadoRequest.interface';
import { IStockProductoResponse } from '../interfaces/response/IStockProductoResponse.interface';
import { IStockProductoCreateUpdateRequest } from '../interfaces/request/IStockProductoCreateUpdateRequest.interface';
import { IStockProductoCreateUpdateResponse } from '../interfaces/response/IStockProductoCreateUpdateResponse.interface';
import { IStockProductoDeleteRequest } from '../interfaces/request/IStockProductoDeleteRequest.interface';
import { IStockProductoDeleteResponse } from '../interfaces/response/IStockProductoDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class StockProductoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/stock-producto`;

    constructor() { }

    // #region Listado
    listarStockProductos(request: IStockProductoListadoRequest): Observable<IPaginationResponse<IStockProductoResponse>> {
        const url = `${this.apiUrl}/ListadoStockProducto`;
        return this.http.post<IApiResponse<IPaginationResponse<IStockProductoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener stock de productos');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarStockProducto(request: IStockProductoCreateUpdateRequest): Observable<IStockProductoCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarStockProducto`;
        return this.http.post<IApiResponse<IStockProductoCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el stock de producto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar (Reiniciar)
    eliminarStockProducto(request: IStockProductoDeleteRequest): Observable<IStockProductoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarStockProducto/${request.iIdAlmacen}/${request.iIdProducto}`;
        return this.http.delete<IApiResponse<IStockProductoDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al reiniciar el stock de producto');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}