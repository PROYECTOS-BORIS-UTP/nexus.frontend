import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICentroCostoListadoRequest } from '../interfaces/request/ICentroCostoListadoRequest.interface';
import { ICentroCostoResponse } from '../interfaces/response/ICentroCostoResponse.interface';
import { ICentroCostoCreateUpdateRequest } from '../interfaces/request/ICentroCostoCreateUpdateRequest.interface';
import { ICentroCostoCreateUpdateResponse } from '../interfaces/response/ICentroCostoCreateUpdateResponse.interface';
import { ICentroCostoDeleteResponse } from '../interfaces/response/ICentroCostoDeleteResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';

@Injectable({
    providedIn: 'root'
})
export class CentroCostoService {

    private http = inject(HttpClient);
    private snackBar = inject(MatSnackBar);
    private apiUrl = `${environment.UrlBase}/centro-costo`;

    constructor() { }

    // #region Listado
    listarCentrosCosto(request: ICentroCostoListadoRequest): Observable<IPaginationResponse<ICentroCostoResponse>> {
        const url = `${this.apiUrl}/ListadoCentroCosto`;
        return this.http.post<IApiResponse<IPaginationResponse<ICentroCostoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener centros de costo');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarCentroCosto(request: ICentroCostoCreateUpdateRequest): Observable<ICentroCostoCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarCentroCosto`;
        return this.http.post<IApiResponse<ICentroCostoCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el centro de costo');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    eliminarCentroCosto(iIdCentroCosto: number): Observable<ICentroCostoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarCentroCosto/${iIdCentroCosto}`;
        return this.http.delete<IApiResponse<ICentroCostoDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el centro de costo');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}