import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { CLIENTE_CONTACTO_ROUTES } from './cliente-contacto/cliente-contacto.routes';
import { CLIENTE_ROUTES } from './cliente/cliente.routes';

export const MANTENIMIENTO_COMERCIAL_ROUTES: Routes = [
    {
        path: ''
        , component: Layout
        , children: [
            {
                path: 'cliente'
                , children: CLIENTE_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
            {
                path: 'cliente-contacto'
                , children: CLIENTE_CONTACTO_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
        ],
    }
];