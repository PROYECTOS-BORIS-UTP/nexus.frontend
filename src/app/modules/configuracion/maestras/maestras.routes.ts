import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import{COMPANIA_ROUTES} from './compania/compania.routes';

export const MAESTRAS_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {    path: 'compania'
                , children: COMPANIA_ROUTES
                , data: { breadcrumb: 'Compania', icon: 'house' }
            }
        ],
    }
];
