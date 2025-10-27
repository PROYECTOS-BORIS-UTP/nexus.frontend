// src/app/modules/configuracion/ubigeo/services/ubigeo.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IUbigeoListadoRequest } from '../interfaces/request/IUbigeoListadoRequest.interface';
import { IUbigeoResponse } from '../interfaces/response/IUbigeoResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class UbigeoService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/ubigeo`; // URL base para Ubigeo

    constructor() { }

    /*
     * Obtiene la lista paginada de Ubigeos desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de ubigeos.
     */
    listarUbigeos(request: IUbigeoListadoRequest): Observable<IPaginationResponse<IUbigeoResponse>> {
        const url = `${this.apiUrl}/ListadoUbigeos`;
        return this.http.post<IApiResponse<IPaginationResponse<IUbigeoResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener ubigeos');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarUbigeos:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar ubigeos';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}