import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.route';
import { MAIN_ROUTES } from './modules/main/dashboard/main.route';
import { authGuard } from './core/guards/auth-guard';
import { publicGuard } from './core/guards/public-guard';

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
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
