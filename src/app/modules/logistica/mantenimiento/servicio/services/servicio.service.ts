import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IServicioListadoRequest } from '../interfaces/request/IServicioListadoRequest.interface';
import { IServicioResponse } from '../interfaces/response/IServicioResponse.interface';
import { IServicioCreateUpdateRequest } from '../interfaces/request/IServicioCreateUpdateRequest.interface';
import { IServicioCreateUpdateResponse } from '../interfaces/response/IServicioCreateUpdateResponse.interface';
import { IServicioDeleteRequest } from '../interfaces/request/IServicioDeleteRequest.interface';
import { IServicioDeleteResponse } from '../interfaces/response/IServicioDeleteResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class ServicioService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/servicio`;

    constructor() { }

    // #region Listado
    listarServicios(request: IServicioListadoRequest): Observable<IPaginationResponse<IServicioResponse>> {
        const url = `${this.apiUrl}/ListadoServicio`;
        return this.http.post<IApiResponse<IPaginationResponse<IServicioResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener servicios');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Crear/Actualizar
    crearActualizarServicio(request: IServicioCreateUpdateRequest): Observable<IServicioCreateUpdateResponse> {
        const url = `${this.apiUrl}/CrearActualizarServicio`;
        return this.http.post<IApiResponse<IServicioCreateUpdateResponse>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al guardar el servicio');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion

    // #region Eliminar
    eliminarServicio(request: IServicioDeleteRequest): Observable<IServicioDeleteResponse> {
        const url = `${this.apiUrl}/EliminarServicio/${request.iIdServicio}`;
        return this.http.delete<IApiResponse<IServicioDeleteResponse>>(url).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error al eliminar el servicio');
                }
            }),
            catchError(handleHttpError)
        );
    }
    // #endregion
}
