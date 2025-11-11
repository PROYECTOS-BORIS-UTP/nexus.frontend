import { Routes } from '@angular/router';
import { ALMACEN_MANTENIMIENTO_ROUTES } from './mantenimiento/mantenimiento-almacen.routes';
import { ALMACEN_TRANSACCION_ROUTES } from './transaccion/almacen-transaccion.routes';

export const ALMACEN_MAIN_ROUTES: Routes = [
    {
        path: 'mantenimiento-almacen',
        children: ALMACEN_MANTENIMIENTO_ROUTES
    },
    {
        path: 'transaccion-almacen',
        children: ALMACEN_TRANSACCION_ROUTES
    },
];