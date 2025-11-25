import { Routes } from '@angular/router';
import { FamiliaPage } from './pages/familia-page/familia-page';

export const FAMILIA_ROUTES: Routes = [
    {
        path: ''
        , component: FamiliaPage
        , data: { breadcrumb: 'Almacén', icon: 'forklift' }
    }
];