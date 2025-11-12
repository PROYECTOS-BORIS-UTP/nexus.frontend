import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { MOVIMIENTOS_ROUTES } from './movimientos/movimientos.routes';
import { REQUERIMIENTOCOMPRA_ROUTES } from './requerimiento-compra/requerimiento-compra.routes';
import { REQUERIMIENTOSERVICIO_ROUTES } from './requerimiento-servicio/requerimiento-servicio.routes';
import { STOCKPRODUCTO_ROUTES } from './stock-producto/stock-producto.routes';

export const ALMACEN_TRANSACCION_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'movimientos'
                ,children: MOVIMIENTOS_ROUTES
                ,data: { breadcrumb: 'Transsacción', icon: 'security' }
            },
        ],
    },
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'requerimiento-compra'
                ,children: REQUERIMIENTOCOMPRA_ROUTES
                ,data: { breadcrumb: 'Transsacción', icon: 'security' }
            },
        ],
    },
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'requerimiento-servicio'
                ,children: REQUERIMIENTOSERVICIO_ROUTES
                ,data: { breadcrumb: 'Transsacción', icon: 'security' }
            },
        ],
    },
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'stock-producto'
                ,children: STOCKPRODUCTO_ROUTES
                ,data: { breadcrumb: 'Transsacción', icon: 'security' }
            },
        ],
    }
];