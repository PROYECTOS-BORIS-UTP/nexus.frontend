import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { COTIZACION_ROUTES } from './cotizacion/cotizacion.routes';

export const TRANSACCION_COMERCIAL_ROUTES: Routes = [
    {
        path: ''
        , component: Layout
        , children: [
            {
                path: 'cotizacion'
                , children: COTIZACION_ROUTES
                , data: { breadcrumb: 'Transacción', icon: 'security' }
            },
        ],
    },
];