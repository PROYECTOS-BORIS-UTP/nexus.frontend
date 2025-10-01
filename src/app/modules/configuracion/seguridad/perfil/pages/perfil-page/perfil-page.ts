import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { Perfil } from '../../../usuario/pages/usuario-page/usuario-page';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { EstadoUsuario } from '../../../usuario/pages/usuario-page/components/estado-usuario/estado-usuario';
import { PerfilUsuario } from '../../../usuario/pages/usuario-page/components/perfil-usuario/perfil-usuario';

// --- Definimos los datos para esta página ---

// Reutilizamos la constante de perfiles que ya tenías
const PERFILES_OBJ = {
	ADMIN: { iIdPerfil: 1, vNombrePerfil: 'Administrador', vInicialesPerfil: 'AD', vColorPerfil: '#6f42c1' },
	G_COMERCIAL: { iIdPerfil: 2, vNombrePerfil: 'Gerente Comercial', vInicialesPerfil: 'GC', vColorPerfil: '#ff8a80' },
	G_FINANZAS: { iIdPerfil: 3, vNombrePerfil: 'Gerente Finanzas', vInicialesPerfil: 'GF', vColorPerfil: '#8c9eff' },
	J_ALMACEN: { iIdPerfil: 4, vNombrePerfil: 'Jefe Almacén', vInicialesPerfil: 'JA', vColorPerfil: '#b9f6ca' },
	J_CERT: { iIdPerfil: 5, vNombrePerfil: 'Jefe Certificación', vInicialesPerfil: 'JC', vColorPerfil: '#ffc107' },
	J_LOGISTICA: { iIdPerfil: 6, vNombrePerfil: 'Jefe Logística', vInicialesPerfil: 'JL', vColorPerfil: '#f57f17' },
};

// Convertimos el objeto de perfiles en un array para la tabla
const ELEMENT_DATA: Perfil[] = Object.values(PERFILES_OBJ);

@Component({
	selector: 'app-perfil-page',
	imports: [
		CommonModule
		, MatTableModule
        , MatProgressBarModule
        , MatChipsModule
        , MatIconModule
        , MatButtonModule
        , MatMenuModule
        , MatFormFieldModule
        , MatCheckboxModule
        , MatInputModule
        , MatPaginatorModule
        , TableGeneric
	],
	templateUrl: './perfil-page.html',
	styleUrl: './perfil-page.scss'
})
export class PerfilPage {
	// 1. Columnas que se mostrarán
	aDisplayedColumns: string[] = ['select', 'iniciales', 'nombre', 'id'];

	// 2. Datos para la tabla
	data: Perfil[] = ELEMENT_DATA;

	// 3. Modelo de selección para los checkboxes
	selection = new SelectionModel<Perfil>(true, []);

	// 4. Definición de las acciones para la botonera
	profileActions: TableAction[] = [
		{ name: 'edit', label: 'Editar Perfil', icon: 'edit' },
		{ name: 'permissions', label: 'Ver Permisos', icon: 'shield' },
	];

	// --- Lógica de Selección ---
	isAllSelected() {
		return this.selection.selected.length === this.data.length;
	}

	toggleAllRows() {
		this.isAllSelected()
			? this.selection.clear()
			: this.data.forEach(row => this.selection.select(row));
	}

	// --- Manejador de Acciones ---
	onActionClicked(event: { action: string, element: Perfil }): void {
		// console.log('Acción:', event.action, 'en el perfil:', event.element);
		switch (event.action) {
			case 'edit':
				alert(`Editando el perfil: ${event.element.vNombrePerfil}`);
				break;
			case 'permissions':
				alert(`Viendo permisos de: ${event.element.vNombrePerfil}`);
				break;
		}
	}
}
