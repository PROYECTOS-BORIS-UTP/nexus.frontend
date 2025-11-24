import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.routes';
import { MAIN_ROUTES } from './modules/main/dashboard/main.route';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';
import { SEGURIDAD_ROUTES } from './modules/configuracion/seguridad/seguridad.routes';
import { MAESTRAS_ROUTES } from './modules/configuracion/maestras/maestras.routes';
import { ALMACEN_MAIN_ROUTES } from './modules/almacen/almacen-main.routes';
import { LOGISTICA_ROUTES } from './modules/logistica/logistica.routes';
export const routes: Routes = [
    {
        path: '',
        children: AUTH_ROUTES
        , canActivate: [publicGuard]
    },
    {
        path: 'dashboard'
        , children: MAIN_ROUTES
        , canActivate: [authGuard]
        , data: { breadcrumb: 'Dashboard', icon: 'dashboard' }
    },
    {
        path: 'seguridad'
        , children: SEGURIDAD_ROUTES
        , canActivate: [authGuard]
        , data: { breadcrumb: 'Configuración', icon: 'settings' }
    },
    {
        path: 'maestra'
        , children: MAESTRAS_ROUTES
        , canActivate: [authGuard]
        , data: { breadcrumb: 'Configuración', icon: 'settings' }
    },
    {
        path: 'almacen'
        , children: ALMACEN_MAIN_ROUTES
        , canActivate: [authGuard]
        , data: { breadcrumb: 'Almacén', icon: 'warehouse' }
    },
    {
        path: 'logistica'
        , children: LOGISTICA_ROUTES
        , canActivate: [authGuard]
        , data: { breadcrumb: 'Logística', icon: 'warehouse' }
    },
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
