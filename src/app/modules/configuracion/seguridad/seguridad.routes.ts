import { Routes } from '@angular/router';
import { USUARIO_ROUTES } from './usuario/usuario.routes';
import { Layout } from '../../../layout/layout';
import { PERFIL_ROUTES } from './perfil/perfil.routes';
import { OPCION_ROUTES } from './opcion/opcion.routes';

export const SEGURIDAD_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'usuario'
                , children: USUARIO_ROUTES
                , data: { breadcrumb: 'Seguridad', icon: 'security' }
            },
            {
                path: 'perfil'
                , children: PERFIL_ROUTES
                , data: { breadcrumb: 'Seguridad', icon: 'security' }
            },
            {
                path: 'opcion'
                , children: OPCION_ROUTES
                , data: { breadcrumb: 'Seguridad', icon: 'security' }
            },
        ],
    }
];
