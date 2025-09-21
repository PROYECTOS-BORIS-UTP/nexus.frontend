import { Routes } from '@angular/router';
import { USUARIO_ROUTES } from './usuario/usuario.routes';
import { Layout } from '../../../layout/layout';
import { PERFIL_ROUTES } from './perfil/perfil.routes';

export const SEGURIDAD_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'usuario'
                , children: USUARIO_ROUTES
            },
            {
                path: 'perfil'
                , children: PERFIL_ROUTES
            },
        ],
    }
];
