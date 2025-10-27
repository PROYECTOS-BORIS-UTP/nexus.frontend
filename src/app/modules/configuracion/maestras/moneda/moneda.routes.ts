import { Routes } from '@angular/router';
import { MonedaPage } from './pages/moneda-page/moneda-page';

export const MONEDA_ROUTES: Routes = [
    {
        path: ''
        ,component: MonedaPage
        , data: { breadcrumb: 'Moneda', icon: 'savings' }
    }
];