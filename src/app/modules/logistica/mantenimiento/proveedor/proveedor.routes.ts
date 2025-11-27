import { Routes } from '@angular/router';
import { ProveedorPage } from './pages/proveedor-page/proveedor-page';

export const PROVEEDOR_ROUTES: Routes = [
    {
        path: ''
        , component: ProveedorPage
        , data: { breadcrumb: 'Proveedores', icon: 'forklift' }
    }
];