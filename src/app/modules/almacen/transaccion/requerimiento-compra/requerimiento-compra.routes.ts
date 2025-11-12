import { Routes } from '@angular/router';
import { RequerimientoCompraPage } from './pages/requerimiento-compra-page/requerimiento-compra-page';

export const REQUERIMIENTOCOMPRA_ROUTES: Routes = [
    {
        path: ''
        ,component: RequerimientoCompraPage
        ,data: { breadcrumb: 'Opciones', icon: 'checklist' }
    }
];