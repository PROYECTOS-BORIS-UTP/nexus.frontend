import { Routes } from '@angular/router';
import { PersonaPage} from './persona-page';

export const PERSONA_ROUTES: Routes = [
    {
        path: ''
        ,component: PersonaPage        
        , data: { breadcrumb: 'Persona', icon: 'person' }
    }
];