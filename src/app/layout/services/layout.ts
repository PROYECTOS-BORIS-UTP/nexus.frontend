import { inject, Injectable } from '@angular/core';
import { IOpcionByUserRequest, IOpcionByUserResponse } from '../interfaces/ISideBar.interface';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { IApiResponse } from '../../core/interfaces/IApiResponse.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { ENDPOINTS, OPCION } from '../../core/config/endpoints';

@Injectable({
	providedIn: 'root'
})
export class LayoutService {

	private URL_BASE = environment.UrlBase;
	private readonly http = inject(HttpClient);

	private menuItemsSource = new BehaviorSubject<IOpcionByUserResponse[]>([]);
	public menuItems$ = this.menuItemsSource.asObservable();

	private lastMenuPayload: IOpcionByUserRequest | null = null;

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
		// 1. Almacena el payload para futuras recargas
		this.lastMenuPayload = payload;

		// 2. Si ya tenemos datos, los devolvemos directamente (caché).
		const currentMenu = this.menuItemsSource.getValue();
		if (currentMenu.length > 0) {
			return of(currentMenu);
		}

		// 3. Si no hay caché, llamamos al método privado que consulta la API.
		return this.fetchAndCacheMenu(payload);
	}

	/*
	 * ¡MODIFICADO! Este método ahora se llama 'reloadMenu'
	 * Limpia el caché y FORZOSAMENTE vuelve a cargar los datos.
	 * @returns Un Observable que emite el nuevo menú cuando se completa la recarga.
	 */
	public reloadMenu(): Observable<IOpcionByUserResponse[]> {
		if (!this.lastMenuPayload) {
			// No sabemos qué usuario recargar, así que solo limpiamos.
			console.warn('reloadMenu() se llamó sin un payload previo. Limpiando caché.');
			this.menuItemsSource.next([]);
			return of([]);
		}

		// Forzamos la recarga usando el último payload
		return this.fetchAndCacheMenu(this.lastMenuPayload);
	}

	/*
	 * ¡NUEVO! Método privado para centralizar la lógica de fetch y cacheo.
	 */
	private fetchAndCacheMenu(payload: IOpcionByUserRequest): Observable<IOpcionByUserResponse[]> {
		return this.getOpcionByUser(payload).pipe(
			map(response => {
				// Actualizamos nuestro BehaviorSubject con los datos de la API.
				const menuData = (response.bStatus && response.aData) ? response.aData : [];
				this.menuItemsSource.next(menuData);
				return menuData;
			}),
			catchError(err => {
				// En caso de error en el API, emitir un menú vacío
				console.error('Error al recargar el menú:', err);
				this.menuItemsSource.next([]);
				return of([]); // Devuelve un array vacío para que la app no se rompa
			})
		);
	}

	/*
	 * MÉTODO PÚBLICO: Limpia el caché al cerrar sesión.
	 */
	public clearMenuOnLogout(): void {
		this.menuItemsSource.next([]);
		this.lastMenuPayload = null;
	}
}