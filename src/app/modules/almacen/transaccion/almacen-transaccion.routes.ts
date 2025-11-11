import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { MOVIMIENTOS_ROUTES } from './movimientos/movimientos.routes';

export const ALMACEN_TRANSACCION_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'usuario'
                , children: MOVIMIENTOS_ROUTES
                , data: { breadcrumb: 'Seguridad', icon: 'security' }
            },
        ],
    }
];
