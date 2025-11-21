import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { PRODUCTO_ROUTES } from './producto/producto.routes';

export const LOGISTICA_MANTENIMIENTO_ROUTES: Routes = [
    {
        path: ''
        , component: Layout
        , children: [
            {
                path: 'producto'
                , children: PRODUCTO_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
            // {
            //     path: 'familia'
            //     , children: FAMILIA_ROUTES
            //     , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            // },
            // {
            //     path: 'unidad-medida'
            //     , children: UNIDAD_MEDIDA_ROUTES
            //     , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            // },
        ],
    }
];