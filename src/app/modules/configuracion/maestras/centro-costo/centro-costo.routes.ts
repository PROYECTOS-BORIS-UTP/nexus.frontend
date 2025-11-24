import { Routes } from '@angular/router';
import { CentroCostoPage } from './pages/centro-costo-page/centro-costo-page';

export const CENTRO_COSTO_ROUTES: Routes = [
    {
        path: ''
        , component: CentroCostoPage
        , data: { breadcrumb: 'Ubigeo', icon: 'add_location_alt' }
    }
];