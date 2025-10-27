import { Routes } from '@angular/router';
import { Layout } from '../../../layout/layout';
import{ COMPANIA_ROUTES } from './compania/compania.routes';
import { PERSONA_ROUTES } from './persona/persona.routes';
import { UBIGEO_ROUTES } from './ubigeo/ubigeo.routes';
import { TIPO_CAMBIO_ROUTES } from './tipo-cambio/tipo-cambio.routes';
import { MONEDA_ROUTES } from './moneda/moneda.routes';
import { ELEMENTO_SISTEMA_ROUTES } from './elemento-sistema/elemento-sistema.routes';
import { PAIS_ROUTES } from './pais/pais.routes';

export const MAESTRAS_ROUTES: Routes = [
    {   
        path: ''
        ,component: Layout
        , children: [
            {    path: 'compania'
                , children: COMPANIA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'persona'
                , children: PERSONA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'ubigeo'
                , children: UBIGEO_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'tipo-cambio'
                , children: TIPO_CAMBIO_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'moneda'
                , children: MONEDA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'elemento-sistema'
                , children: ELEMENTO_SISTEMA_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            },
            {    path: 'pais'
                , children: PAIS_ROUTES
                , data: { breadcrumb: 'Maestras', icon: 'apps_outage' }
            }
        ],
    }
];