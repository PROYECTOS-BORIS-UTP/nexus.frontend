import { Component } from '@angular/core';
import { IPerfilCreateUpdateRequest } from '../../../../interfaces/request/IPerfilCreateUpdateRequest.interface';



export interface CompaniaFormData {
  compania: IPerfilCreateUpdateRequest | null;
}

@Component({
  selector: 'app-perfil-form',
  imports: [],
  templateUrl: './perfil-form.html',
  styleUrl: './perfil-form.scss'
})



export class PerfilForm {

}
