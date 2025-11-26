import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IUnidadMedidaListadoRequest } from '../interfaces/request/IUnidadMedidaListadoRequest.interface';
import { IUnidadMedidaResponse } from '../interfaces/response/IUnidadMedidaResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class UnidadMedidaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/logistica/mantenimiento/unidad-medida`;

    constructor() { }

    // #region Listado
    listarUnidadesMedida(request: IUnidadMedidaListadoRequest): Observable<IPaginationResponse<IUnidadMedidaResponse>> {
        const url = `${this.apiUrl}/ListadoUnidadMedida`;
        return this.http.post<IApiResponse<IPaginationResponse<IUnidadMedidaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener unidades de medida');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}