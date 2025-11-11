import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { ALMACEN_ROUTES } from './almacen/almacen.routes';

export const ALMACEN_MANTENIMIENTO_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'almacen'
                , children: ALMACEN_ROUTES
                , data: { breadcrumb: 'Mantenimiento', icon: 'inventory' }
            },
        ],
    }
];
