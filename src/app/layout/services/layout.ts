import { inject, Injectable } from '@angular/core';
import { IOpcionByUserRequest, IOpcionByUserResponse } from '../interfaces/ISideBar.interface';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { IApiResponse } from '../../core/interfaces/IApiResponse.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { ENDPOINTS, OPCION } from '../../core/config/endpoints';

@Injectable({
	providedIn: 'root'
})
export class Layout {

	private URL_BASE = environment.UrlBase;
	private readonly http = inject(HttpClient);


	private menuItemsSource = new BehaviorSubject<IOpcionByUserResponse[]>([]);
	public menuItems$ = this.menuItemsSource.asObservable();

	/*
	 * @description Obtiene las opciones del menú para un usuario específico.
	 * @param payload - El ID del usuario.
	 * @returns Un Observable con la respuesta de la API.
	 */
	getOpcionByUser(payload: IOpcionByUserRequest): Observable<IApiResponse<IOpcionByUserResponse[]>> {
		const apiUrl = `${this.URL_BASE}${ENDPOINTS.OPCION}${OPCION.GET_OPTIONS_BY_USER}`;
		return this.http.post<IApiResponse<IOpcionByUserResponse[]>>(apiUrl, payload);
	}

	/*
	 * MÉTODO PÚBLICO: Los componentes llaman a este método.
	 * Carga las opciones del menú, usando el caché si está disponible.
	 * @param payload El ID del usuario.
	 */
	loadMenuOptions(payload: IOpcionByUserRequest): Observable<IOpcionByUserResponse[]> {
		// Si ya tenemos datos en nuestro BehaviorSubject, los devolvemos directamente.
		if (this.menuItemsSource.getValue().length > 0) {
			return of(this.menuItemsSource.getValue());
		}

		// Si no hay datos, llamamos al método privado que consulta la API.
		return this.getOpcionByUser(payload).pipe(
			tap(response => {
				// Actualizamos nuestro BehaviorSubject con los datos de la API.
				const menuData = (response.bStatus && response.aData) ? response.aData : [];
				this.menuItemsSource.next(menuData);
			}),
			// Devolvemos solo el array de opciones.
			map(response => this.menuItemsSource.getValue())
		);
	}

	/*
	 * MÉTODO PÚBLICO: Limpia el caché del menú.
	 */
	clearMenu(): void {
		this.menuItemsSource.next([]);
	}
}