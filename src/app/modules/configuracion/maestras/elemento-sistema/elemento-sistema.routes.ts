import { Routes } from '@angular/router';
import { ElementoSistemaPage } from './pages/elemento-sistema-page/elemento-sistema-page';

export const ELEMENTO_SISTEMA_ROUTES: Routes = [
    {
        path: ''
        ,component: ElementoSistemaPage
        , data: { breadcrumb: 'Elemento del Sistema', icon: 'category' }
    }
];