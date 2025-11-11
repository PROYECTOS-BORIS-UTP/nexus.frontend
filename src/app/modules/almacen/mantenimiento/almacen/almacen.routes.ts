import { Routes } from '@angular/router';
import { AlmacenPage } from './pages/almacen-page/almacen-page';

export const ALMACEN_ROUTES: Routes = [
    {
        path: ''
        ,component: AlmacenPage
        ,data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];