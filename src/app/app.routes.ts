import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.routes';
import { MAIN_ROUTES } from './modules/main/dashboard/main.route';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { SEGURIDAD_ROUTES } from './modules/configuracion/seguridad/seguridad.routes';

export const routes: Routes = [
    {
        path: '',
        children: AUTH_ROUTES
        ,canActivate: [ publicGuard ]
    },
    {
        path: 'dashboard'
        ,children: MAIN_ROUTES
        ,canActivate: [ authGuard ]
    },
    {
        path: 'seguridad'
        ,children: SEGURIDAD_ROUTES
        ,canActivate: [ authGuard ]
    },
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
