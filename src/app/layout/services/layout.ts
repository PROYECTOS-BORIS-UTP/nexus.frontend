import { Injectable } from '@angular/core';
import { IOpcionByUserRequest, IOpcionByUserResponse } from '../interfaces/ISideBar.interface';
import { Observable } from 'rxjs';
import { IApiResponse } from '../../core/interfaces/IApiResponse.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { ENDPOINTS, OPCION } from '../../core/config/endpoints';

@Injectable({
	providedIn: 'root'
})
export class Layout {

	private URL_BASE = environment.UrlBase;

	constructor(
		private http: HttpClient
	) {}
	/*
	 * @description Obtiene las opciones del menú para un usuario específico.
	 * @param payload - El ID del usuario.
	 * @returns Un Observable con la respuesta de la API.
	 */
	getOpcionByUser(payload: IOpcionByUserRequest): Observable<IApiResponse<IOpcionByUserResponse[]>> {
		const apiUrl = `${this.URL_BASE}${ENDPOINTS.OPCION}${OPCION.GET_OPTIONS_BY_USER}`;
		return this.http.post<IApiResponse<IOpcionByUserResponse[]>>(apiUrl, payload);
	}
}