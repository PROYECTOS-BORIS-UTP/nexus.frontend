import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { ORDEN_COMPRA_ROUTES } from './orden-compra/orden-compra.routes';
import { ORDEN_SERVICIO_ROUTES } from './orden-servicio/orden-servicio.routes';

export const LOGISTICA_TRANSACCION_ROUTES: Routes = [
    {
        path: ''
        , component: Layout
        , children: [
            {
                path: 'orden-compra'
                , children: ORDEN_COMPRA_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
            {
                path: 'orden-servicio'
                , children: ORDEN_SERVICIO_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            }
        ],
    }
];