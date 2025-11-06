import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IPerfilListadoRequest } from '../interfaces/request/IPerfilListadoRequest.interface';
import { IPerfilResponse } from '../interfaces/response/IPerfilResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';


@Injectable({
    providedIn: 'root'
})
export class PerfilService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/perfil`;

    constructor() { }

    /*
     * Obtiene la lista paginada de perfiles desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de perfiles.
     */
    listarPerfiles(request: IPerfilListadoRequest): Observable<IPaginationResponse<IPerfilResponse>> {
        const url = `${this.apiUrl}/ListadoPerfil`;
        return this.http.post<IApiResponse<IPaginationResponse<IPerfilResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener perfiles');
                }
            }),
            catchError(handleHttpError)
        );
    }

}