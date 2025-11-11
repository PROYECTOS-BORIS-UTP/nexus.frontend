import { Routes } from '@angular/router';
import { OpcionPage } from '../../../configuracion/seguridad/opcion/pages/opcion-page/opcion-page';

export const OPCION_ROUTES: Routes = [
    {
        path: ''
        ,component: OpcionPage
        ,data: { breadcrumb: 'Opciones', icon: 'checklist' }
    }
];