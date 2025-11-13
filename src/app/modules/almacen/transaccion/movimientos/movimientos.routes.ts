import { Routes } from '@angular/router';
import { MovimientosPage } from './pages/movimientos-page/movimientos-page';

export const MOVIMIENTOS_ROUTES: Routes = [
    {
        path: ''
        ,component: MovimientosPage
        ,data: { breadcrumb: 'Movimientos', icon: 'checklist' }
    }
];