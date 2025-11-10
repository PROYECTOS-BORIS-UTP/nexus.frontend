import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ITipoCambioListadoRequest } from '../interfaces/request/ITipoCambioListadoRequest.interface';
import { ITipoCambioResponse } from '../interfaces/response/ITipoCambioResponse.interface';
import { environment } from '../../../../../../environments/environments';
import { IApiResponse } from '../../../../../core/interfaces/IApiResponse.interface';
import { IPaginationResponse } from '../../../../../core/interfaces/IPaginationResponse.interface';
import { handleHttpError } from '../../../../../core/utils/error-handler.utils';
import { ITipoCambioCreateUpdateResponse } from '../interfaces/response/ITipoCambioCreateUpdateResponse.interface';
import { ITipoCambioCreateUpdateRequest } from '../interfaces/request/ITipoCambioCreateUpdateRequest.interface';

@Injectable({
  providedIn: 'root',
})
export class TipoCambioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.UrlBase}/tipo-cambio`;

  constructor() {}

  /*
   * Obtiene la lista paginada de Tipos de Cambio desde el backend.
   * @param request DTO con parámetros de paginación y filtros.
   * @returns Un Observable con la respuesta paginada de tipos de cambio.
   */
  listarTiposCambio(
    request: ITipoCambioListadoRequest
  ): Observable<IPaginationResponse<ITipoCambioResponse>> {
    const url = `${this.apiUrl}/ListadoTipoCambio`; // Endpoint específico
    return this.http
      .post<IApiResponse<IPaginationResponse<ITipoCambioResponse>>>(url, request)
      .pipe(
        map((response) => {
          if (response.bStatus && response.aData) {
            return response.aData;
          } else {
            throw new Error(response.vMessage || 'Error desconocido al obtener tipos de cambio');
          }
        }),
        catchError(handleHttpError)
      );
  }

  /*
   * Envía una solicitud para crear o actualizar un tipo de cambio.
   * @param request DTO con los datos del tipo de cambio.
   * @returns Un Observable con la respuesta del backend.
   */
  crearActualizarTipoCambio(
    request: ITipoCambioCreateUpdateRequest
  ): Observable<ITipoCambioCreateUpdateResponse> {
    const url = `${this.apiUrl}/CrearActualizarTipoCambio`;

    return this.http.post<ITipoCambioCreateUpdateResponse>(url, request).pipe(
      map((response) => {
        if (response && typeof response.bStatus === 'boolean') {
          if (response.bStatus) {
            return response;
          } else {
            throw new Error(
              response.vMensaje || 'El backend indicó un error al crear/actualizar el tipo de cambio.'
            );
          }
        } else {
          console.error('Respuesta inesperada del backend:', response);
          throw new Error('Respuesta inesperada del servidor al crear/actualizar.');
        }
      }),
      catchError(handleHttpError)
    );
  }

}
