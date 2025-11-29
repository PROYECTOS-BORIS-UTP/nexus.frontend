import { Routes } from '@angular/router';
import { OrdenServicioPage } from './pages/orden-servicio-page/orden-servicio-page';

export const ORDEN_SERVICIO_ROUTES: Routes = [
    {
        path: ''
        , component: OrdenServicioPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];