import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Layout } from '../../../layout/layout';

export const MAIN_ROUTES: Routes = [
    {
        path: ''
        , component: Layout
        , children: [
            {
                path: ''
                ,component: Dashboard
            },
            {
                path: 'inicio'
                ,component: Dashboard
            },
        ],
    }
];
