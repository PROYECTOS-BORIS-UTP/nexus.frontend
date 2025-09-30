import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
	selector: 'app-estado-usuario',
	imports: [
		CommonModule, MatChipsModule
	],
	templateUrl: './estado-usuario.html',
	styleUrl: './estado-usuario.scss'
})
export class EstadoUsuario {
	// Inputs para recibir los datos del estado
	@Input() iIdEstado: number = 0;
	@Input() vNombreEstado: string = 'Desconocido';

	// Variable para la clase CSS
	vStatusClass: string = '';

	ngOnChanges() {
		// Asignamos la clase basándonos en el ID del estado
		console.log(this.iIdEstado);
		switch (this.iIdEstado) {
			case 1: // Activo
				this.vStatusClass = 'status-active';
				break;
			case 2: // Inactivo
				this.vStatusClass = 'status-inactive';
				break;
			case 3: // Pendiente
				this.vStatusClass = 'status-pending';
				break;
			default:
				this.vStatusClass = '';
		}
	}
}
