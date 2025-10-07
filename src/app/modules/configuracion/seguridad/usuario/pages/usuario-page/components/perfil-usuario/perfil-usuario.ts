import { Component, Input } from '@angular/core';
import { Perfil } from '../../usuario-page';

@Component({
	selector: 'app-perfil-usuario',
	imports: [],
	templateUrl: './perfil-usuario.html',
	styleUrl: './perfil-usuario.scss'
})
export class PerfilUsuario {
	@Input() oPerfil!: Perfil;
}