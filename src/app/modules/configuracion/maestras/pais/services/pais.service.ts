import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IPaisListadoRequest } from '../interfaces/request/IPaisListadoRequest.interface';
import { IPaisResponse } from '../interfaces/response/IPaisResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class PaisService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/pais`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Países desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de países.
     */
    listarPaises(request: IPaisListadoRequest): Observable<IPaginationResponse<IPaisResponse>> {
        const url = `${this.apiUrl}/ListadoPaises`;
        return this.http.post<IApiResponse<IPaginationResponse<IPaisResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener países');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarPaises:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar países';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}