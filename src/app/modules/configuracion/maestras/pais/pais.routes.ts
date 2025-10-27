import { Routes } from '@angular/router';
import { PaisPage } from './pages/pais-page/pais-page';

export const PAIS_ROUTES: Routes = [
    {
        path: ''
        ,component: PaisPage
        , data: { breadcrumb: 'País', icon: 'language' }
    }
];