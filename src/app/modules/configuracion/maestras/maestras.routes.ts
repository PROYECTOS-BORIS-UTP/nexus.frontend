import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import{COMPANIA_ROUTES} from './compania/compania.routes';
import { PERSONA_ROUTES } from './persona/pages/persona-page/persona.routes';

export const MAESTRAS_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {    path: 'compania'
                , children: COMPANIA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'woman' }
            },
            {    path: 'persona'
                , children: PERSONA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'woman' }
            }
        ],
    }
];
