import { Routes } from '@angular/router';
import { StockProductoPage } from './pages/stock-producto-page/stock-producto-page';

export const STOCKPRODUCTO_ROUTES: Routes = [
    {
        path: ''
        ,component: StockProductoPage
        ,data: { breadcrumb: 'Opciones', icon: 'checklist' }
    }
];