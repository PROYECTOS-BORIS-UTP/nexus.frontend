import { Routes } from '@angular/router';
import { ProductoPage } from './pages/producto-page/producto-page';

export const PRODUCTO_ROUTES: Routes = [
    {
        path: ''
        , component: ProductoPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];