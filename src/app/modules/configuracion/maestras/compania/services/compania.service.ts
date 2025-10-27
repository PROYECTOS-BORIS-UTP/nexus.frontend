import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ICompaniaListadoRequest } from '../interfaces/request/ICompaniaListadoRequest.interface';
import { ICompaniaResponse } from '../interfaces/response/ICompaniaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class CompaniaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/compania`;

    constructor() { }

    /*
     * Obtiene la lista paginada de compañías desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de compañías.
     */
    listarCompanias(request: ICompaniaListadoRequest): Observable<IPaginationResponse<ICompaniaResponse>> {
        const url = `${this.apiUrl}/ListadoCompanias`;
        return this.http.post<IApiResponse<IPaginationResponse<ICompaniaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener compañías');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarCompanias:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar compañías';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}