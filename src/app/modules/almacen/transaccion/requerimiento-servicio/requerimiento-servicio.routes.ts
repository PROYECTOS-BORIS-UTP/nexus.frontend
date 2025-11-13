import { Routes } from '@angular/router';
import { RequerimientoServicioPage } from './pages/requerimiento-servicio-page/requerimiento-servicio-page';

export const REQUERIMIENTOSERVICIO_ROUTES: Routes = [
    {
        path: ''
        ,component: RequerimientoServicioPage
        ,data: { breadcrumb: 'Opciones', icon: 'checklist' }
    }
];