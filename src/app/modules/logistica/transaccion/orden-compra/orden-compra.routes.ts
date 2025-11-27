import { Routes } from '@angular/router';
import { OrdenCompraPage } from './pages/orden-compra-page/orden-compra-page';

export const ORDEN_COMPRA_ROUTES: Routes = [
    {
        path: ''
        , component: OrdenCompraPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];