// src/app/modules/configuracion/ubigeo/services/ubigeo.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { IUbigeoListadoRequest } from '../interfaces/request/IUbigeoListadoRequest.interface';
import { IUbigeoResponse } from '../interfaces/response/IUbigeoResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { IUbigeoCreateUpdateRequest } from '../interfaces/request/IUbigeoCreateUpdateRequest.interface';
import { IUbigeoCreateUpdateResponse } from '../interfaces/response/IUbigeoCreateUpdateResponse.interface';
import { IUbigeoDeleteResponse } from '../interfaces/response/IUbigeoDeleteResponse.interface';


@Injectable({
    providedIn: 'root'
})
export class UbigeoService { // <-- Inicio de la clase

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
                    // Usar vMessage si está disponible, si no, usar mensaje de error.
                    throw new Error(response.vMessage || 'Error desconocido al obtener ubigeos');
                }
            }),
            catchError(error => {
                console.error('Error en la llamada HTTP a listarUbigeos:', error);
                // Aquí se usa throwError para propagar un error de tipo Error
                const errorMessage = error?.error?.vMessage || error?.message || 'Error del servidor al listar ubigeos';
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /*
     * Envía una solicitud para crear o actualizar el ubigeo.
     * Se asume que la respuesta viene envuelta en IApiResponse.
     * @param request DTO con los datos del ubigeo.
     * @returns Un Observable con la respuesta del backend.
     */
    crearActualizarUbigeo(request: IUbigeoCreateUpdateRequest): Observable<IUbigeoCreateUpdateResponse> {
        const url = `${this.apiUrl}/crearActualizarUbigeo`;
        // Se espera el wrapper IApiResponse<T>
        return this.http.post<IApiResponse<IUbigeoCreateUpdateResponse>>(url, request).pipe(
            map(responseWrapper => {
                // Se verifica el estado del wrapper principal
                if (responseWrapper.bStatus && responseWrapper.aData) {
                    // Si todo OK, se devuelve el objeto de datos real (aData)
                    return responseWrapper.aData;
                } else {
                    // Si bStatus es false, se lanza el error con el mensaje
                    throw new Error(responseWrapper.vMessage || 'El backend indicó un error al crear/actualizar el elemento.');
                }
            }),
            catchError(handleHttpError) // Usa el manejador de errores centralizado
        );
    }

    /*
     * Envía una solicitud para eliminar (baja lógica) el ubigeo.
     * Se asume que la respuesta viene envuelta en IApiResponse.
     * @param iIdUbigeo ID del elemento a eliminar.
     * @returns Un Observable con la respuesta del backend.
     */
    eliminarUbigeo(iIdUbigeo: number): Observable<IUbigeoDeleteResponse> {
        const url = `${this.apiUrl}/EliminarUbigeo/${iIdUbigeo}`;
        // Se espera el wrapper IApiResponse<T>
        return this.http.delete<IApiResponse<IUbigeoDeleteResponse>>(url).pipe(
            map(responseWrapper => {
                // Se verifica el estado del wrapper principal
                if (responseWrapper.bStatus && responseWrapper.aData) {
                    // Si todo OK, se devuelve el objeto de datos real (aData)
                    return responseWrapper.aData;
                } else {
                    // Si bStatus es false, se lanza el error con el mensaje
                    throw new Error(responseWrapper.vMessage || 'El backend indicó un error al eliminar el elemento.');
                }
            }),
            catchError(handleHttpError) // Usa el manejador de errores centralizado
        );
    }
} // <-- Fin de la clase