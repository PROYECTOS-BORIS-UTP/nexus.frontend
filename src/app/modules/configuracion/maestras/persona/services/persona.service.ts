// src/app/modules/maestros/persona/services/persona.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IPersonaListadoRequest } from '../interfaces/request/IPersonaListadoRequest.interface';
import { IPersonaResponse } from '../interfaces/response/IPersonaResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class PersonaService {

    private http = inject(HttpClient);
    private apiUrl = `${environment.UrlBase}/persona`; // URL base para Persona

    constructor() { }

    /*
     * Obtiene la lista paginada de personas desde el backend.
     * @param request DTO con parámetros de paginación y filtros.
     * @returns Un Observable con la respuesta paginada de personas.
     */
    listarPersonas(request: IPersonaListadoRequest): Observable<IPaginationResponse<IPersonaResponse>> {
        const url = `${this.apiUrl}/ListadoPersonas`;
        return this.http.post<IApiResponse<IPaginationResponse<IPersonaResponse>>>(url, request).pipe(
            map(response => {
                if (response.bStatus && response.aData) {
                    return response.aData;
                } else {
                    throw new Error(response.vMessage || 'Error desconocido al obtener personas');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarPersonas:', error);
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar personas';
                return throwError(() => new Error(errorMessage));
            })
        );
    }
}