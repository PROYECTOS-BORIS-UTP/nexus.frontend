import { Routes } from '@angular/router';
import { PerfilPage } from './pages/perfil-page/perfil-page';

export const PERFIL_ROUTES: Routes = [
    {
        path: ''
        ,component: PerfilPage
        ,data: { breadcrumb: 'Perfiles', icon: 'badge' }
    }
];