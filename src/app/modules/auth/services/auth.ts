import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IApiResponse } from '../../../core/interfaces/IApiResponse.interface';
import { IAuthenticactionRequest, IAuthenticationResponse, IUser } from '../interfaces/IAuth.interface';
import { environment } from '../../../../environments/environments';
import { AUTH, ENDPOINTS } from '../../../core/config/endpoints';

@Injectable({
	providedIn: 'root'
})
export class Auth {

	private URL_BASE = environment.UrlBase;

	constructor(private http: HttpClient) { }

	/*
   * Envía las credenciales al backend para iniciar sesión.
   * @param credentials Objeto con vUsuario y vPassword.
   * @returns Un Observable con la respuesta completa de la API, fuertemente tipada.
   */
	Authentication(credentials: IAuthenticactionRequest): Observable<IApiResponse<IAuthenticationResponse>> {
		return this.http.post<IApiResponse<IAuthenticationResponse>>(`${this.URL_BASE}${ENDPOINTS.AUTH}${AUTH.AUTHENTICATION}`, credentials);
	}

	/*
	 * Guarda el token y los datos del usuario en el localStorage.
	 * @param authData El objeto aData de la respuesta de la API.
	 */
	public saveSession(authData: IAuthenticationResponse): void {
		localStorage.setItem('token', authData.token);
		// localStorage solo guarda strings, por eso convertimos el objeto user a un string JSON.
		localStorage.setItem('user', JSON.stringify(authData.user));
	}

	/*
	 * Obtiene el token del usuario desde el localStorage.
	 */
	public getToken(): string | null {
		return localStorage.getItem('token');
	}

	/*
	 * Obtiene los datos del usuario desde el localStorage.
	 */
	public getUser(): IUser | null {
		const userJson = localStorage.getItem('user');
		if (userJson) {
			return JSON.parse(userJson) as IUser;
		}
		return null;
	}

	/*
	 * Elimina los datos de la sesión del localStorage para cerrar sesión.
	 */
	public logout(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
	}
}