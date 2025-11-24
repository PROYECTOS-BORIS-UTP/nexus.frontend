import { Routes } from '@angular/router';
import { ServicioPage } from './pages/servicio-page/servicio-page';

export const SERVICIO_ROUTES: Routes = [
    {
        path: ''
        , component: ServicioPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];