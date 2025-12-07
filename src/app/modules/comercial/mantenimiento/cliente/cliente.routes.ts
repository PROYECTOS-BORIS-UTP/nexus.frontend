import { Routes } from '@angular/router';
import { ClientePage } from '../cliente/pages/cliente-page/cliente-page';

export const CLIENTE_ROUTES: Routes = [
    {
        path: ''
        , component: ClientePage
        , data: { breadcrumb: 'Cliente', icon: 'person' }
    }
];