import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../modules/auth/services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(Auth);
	const token = authService.getToken();

	// Si hay un token, clonamos la petición y le añadimos el header de autorización
	if (token) {
		const clonedReq = req.clone({
			headers: req.headers.set('Authorization', `Bearer ${token}`)
		});
		return next(clonedReq);
	}

	// Si no hay token, dejamos pasar la petición original (para el login, por ejemplo)
	return next(req);
};