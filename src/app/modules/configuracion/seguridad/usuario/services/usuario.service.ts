import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IUsuarioListadoRequest } from '../interfaces/request/IUsuarioListadoRequest.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IUsuarioResponse } from '../interfaces/response/IUsuarioResponse.interface';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/usuario`;

    constructor() { }

    /*
     * Obtiene la lista paginada de usuarios desde el backend.
     * Espera una respuesta envuelta en IApiResponse que contiene IPaginationResponse.
     * @param request DTO con los parámetros de paginación y filtros (IUsuarioListadoRequest).
     * @returns Un Observable con la respuesta paginada (IPaginationResponse desde core).
     */
    listarUsuarios(request: IUsuarioListadoRequest): Observable<IPaginationResponse<IUsuarioResponse>> { // Usa IPaginationResponse del core
        const url = `${this.apiUrl}/ListadoUsuario`;
        return this.http.post<IApiResponse<IPaginationResponse<IUsuarioResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener usuarios');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarUsuarios:', error);
                return throwError(() => new Error(error.message || 'Error del servidor al listar usuarios'));
            })
        );
    }
}