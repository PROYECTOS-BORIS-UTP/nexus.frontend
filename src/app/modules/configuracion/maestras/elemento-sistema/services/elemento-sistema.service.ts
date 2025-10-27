import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IElementoSistemaListadoRequest } from '../interfaces/request/IElementoSistemaListadoRequest.interface';
import { IElementoSistemaResponse } from '../interfaces/response/IElementoSistemaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class ElementoSistemaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/elemento-sistema`;

    constructor() { }

    /*
     * Obtiene la lista paginada de Elementos del Sistema desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de elementos.
     */
    listarElementosSistema(request: IElementoSistemaListadoRequest): Observable<IPaginationResponse<IElementoSistemaResponse>> {
        const url = `${this.apiUrl}/ListadoElementosSistema`;
        return this.http.post<IApiResponse<IPaginationResponse<IElementoSistemaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener elementos del sistema');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarElementosSistema:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar elementos del sistema';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}