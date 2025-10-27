import { Routes } from '@angular/router';
import { TipoCambioPage } from './pages/tipo-cambio-page/tipo-cambio-page';

export const TIPO_CAMBIO_ROUTES: Routes = [
    {
        path: ''
        ,component: TipoCambioPage      
        , data: { breadcrumb: 'Tipo de Cambio', icon: 'currency_exchange' }
    }
];