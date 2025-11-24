import { Routes } from '@angular/router';
import { UnidadMedidaPage } from './pages/unidad-medida-page/unidad-medida-page';

export const UNIDAD_MEDIDA_ROUTES: Routes = [
    {
        path: ''
        , component: UnidadMedidaPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];