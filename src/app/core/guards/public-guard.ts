import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../modules/auth/services/auth';

export const publicGuard: CanActivateFn = (route, state) => {
	const authService = inject(Auth);
	const router = inject(Router);

	if (authService.getToken()) {
		// Si ya existe un token, redirige al dashboard
		router.navigate(['/dashboard']);
		return false;
	} else {
		// Si no hay token, permite el acceso (para que pueda ir al login)
		return true;
	}
};