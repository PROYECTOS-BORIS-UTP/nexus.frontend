import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { PRODUCTO_ROUTES } from './producto/producto.routes';
import { UNIDAD_MEDIDA_ROUTES } from './unidad-medida/unidad-medida.routes';
import { SERVICIO_ROUTES } from './servicio/servicio.routes';
import { FAMILIA_ROUTES } from './familia/familia.routes';
import { PROVEEDOR_ROUTES } from './proveedor/proveedor.routes';

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

            {
                path: 'familia'
                , children: FAMILIA_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },

            {
                path: 'unidad-medida'
                , children: UNIDAD_MEDIDA_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
            {
                path: 'servicio'
                , children: SERVICIO_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },

            {
                path: 'proveedor'
                , children: PROVEEDOR_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },

        ],
    }
];