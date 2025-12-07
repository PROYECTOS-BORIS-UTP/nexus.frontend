import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
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
            }
        ],
    }
];