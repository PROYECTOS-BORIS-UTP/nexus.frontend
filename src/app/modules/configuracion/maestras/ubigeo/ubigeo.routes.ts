import { Routes } from '@angular/router';
import { UbigeoPage } from './pages/ubigeo-page/ubigeo-page';

export const UBIGEO_ROUTES: Routes = [
    {
        path: ''
        ,component: UbigeoPage
        , data: { breadcrumb: 'Ubigeo', icon: 'add_location_alt' }
    }
];