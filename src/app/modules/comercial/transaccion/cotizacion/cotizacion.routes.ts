import { Routes } from '@angular/router';
import { CotizacionPage } from './pages/cotizacion-page/cotizacion-page';

export const COTIZACION_ROUTES: Routes = [
    {
        path: ''
        , component: CotizacionPage
        , data: { breadcrumb: 'Cotización', icon: 'security' }
    }
];