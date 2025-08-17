import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './modules/auth/auth.route';

export const routes: Routes = [
    {
        path: '',
        children: AUTH_ROUTES
    },
    { path: '', redirectTo: '', pathMatch: 'full' },
    { path: '**', redirectTo: '' }
];
