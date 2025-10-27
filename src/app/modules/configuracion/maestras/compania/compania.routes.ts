import { Routes } from '@angular/router';
import { CompaniaPage} from './pages/compania-page/compania-page';

export const COMPANIA_ROUTES: Routes = [
    {
        path: ''
        ,component: CompaniaPage        
        , data: { breadcrumb: 'Compania', icon: 'apartment' }
    }
];