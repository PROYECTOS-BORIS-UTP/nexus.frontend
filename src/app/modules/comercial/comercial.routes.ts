import { Routes } from '@angular/router';
import { MANTENIMIENTO_COMERCIAL_ROUTES } from './mantenimiento/mantenimiento-comercial.routes';
import { TRANSACCION_COMERCIAL_ROUTES } from './transaccion/transaccion-comercial.routes';

export const COMERCIAL_ROUTES: Routes = [
    {
        path: 'mantenimiento-comercial',
        children: MANTENIMIENTO_COMERCIAL_ROUTES
    },
    {
        path: 'transaccion-comercial',
        children: TRANSACCION_COMERCIAL_ROUTES
    },
];