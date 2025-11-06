import { Routes } from '@angular/router';
import { OpcionPage } from './pages/opcion-page/opcion-page';

export const OPCION_ROUTES: Routes = [
    {
        path: ''
        ,component: OpcionPage
        ,data: { breadcrumb: 'Opciones', icon: 'checklist' }
    }
];