import { Routes } from '@angular/router';
import { UsuarioPage } from './pages/usuario-page/usuario-page';

export const USUARIO_ROUTES: Routes = [
    {
        path: ''
        ,component: UsuarioPage
        , data: { breadcrumb: 'Usuarios', icon: 'group' }
    }
];