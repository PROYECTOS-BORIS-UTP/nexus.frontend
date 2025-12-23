import { Routes } from '@angular/router';
import { LOGISTICA_MANTENIMIENTO_ROUTES } from './mantenimiento/mantenimiento-logistica.routes';

import { LOGISTICA_TRANSACCION_ROUTES } from './transaccion/transaccion-logistica.routes';


export const LOGISTICA_ROUTES: Routes = [
    {
        path: 'mantenimiento-logistica',
        children: LOGISTICA_MANTENIMIENTO_ROUTES
    },

    {
        path: 'transaccion-logistica',
        children: LOGISTICA_TRANSACCION_ROUTES
    },
];