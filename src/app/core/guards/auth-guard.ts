import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../modules/auth/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(Auth);
	const router = inject(Router);

	if (authService.getToken()) {
		return true; // Si existe un token, permite el acceso a la ruta
	} else {
		// Si no existe un token, redirige al login
		router.navigate(['/login']);
		return false;
	}
};
