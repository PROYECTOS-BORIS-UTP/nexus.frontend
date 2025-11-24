import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IFamiliaListadoRequest } from '../interfaces/request/IFamiliaListadoRequest.interface';
import { IFamiliaResponse } from '../interfaces/response/IFamiliaResponse.interface';

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
}