import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IFamiliaListadoRequest } from '../interfaces/request/IFamiliaListadoRequest.interface';
import { IFamiliaResponse } from '../interfaces/response/IFamiliaResponse.interface';
import { IFamiliaCreateUpdateRequest } from '../interfaces/request/IFamiliaCreateUpdateRequest.interface';
import { IFamiliaCreateUpdateResponse } from '../interfaces/response/IFamiliaCreateUpdateResponse.interface';
import { IFamiliaDeleteRequest } from '../interfaces/request/IFamiliaDeleteRequest.interface';
import { IFamiliaDeleteResponse } from '../interfaces/response/IFamiliaDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class FamiliaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/logistica/mantenimiento/familia`;

    constructor() { }

    // #region Listado
    listarFamilias(request: IFamiliaListadoRequest): Observable<IPaginationResponse<IFamiliaResponse>> {
        const url = `${this.apiUrl}/ListadoFamilia`;
        return this.http.post<IApiResponse<IPaginationResponse<IFamiliaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener familias');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarFamilia(request: IFamiliaCreateUpdateRequest): Observable<IFamiliaCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarFamilia`;
        return this.http.post<IApiResponse<IFamiliaCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar la familia');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    eliminarFamilia(request: IFamiliaDeleteRequest): Observable<IFamiliaDeleteResponse> {
        const url = `${this.apiUrl}/EliminarFamilia/${request.iIdFamilia}`;
        return this.http.delete<IApiResponse<IFamiliaDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar la familia');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}