import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import { PERSONA_ROUTES } from './persona/persona.routes';

export const MAESTRAS_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {
                path: 'persona'
                , children: PERSONA_ROUTES
            },
        ],
    }
];
