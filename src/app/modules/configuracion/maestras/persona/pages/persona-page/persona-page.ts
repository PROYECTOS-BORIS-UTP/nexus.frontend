import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { Persona } from '../../../persona/pages/persona-page/persona-page';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-persona-page',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    MatPaginatorModule,
    TableGeneric,
  ],
  templateUrl: './persona-page.html',
  styleUrl: './persona-page.scss',
})
export class PersonaPage {
  // 1. Columnas que se mostrarán
  aDisplayedColumns: string[] = ['select', 'iniciales', 'nombre', 'id'];

  // 2. Datos para la tabla
  data: Persona[] = ELEMENT_DATA;

  // 3. Modelo de selección para los checkboxes
  selection = new SelectionModel<Persona>(true, []);

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
      : this.data.forEach((row) => this.selection.select(row));
  }

  // --- Manejador de Acciones ---
  onActionClicked(event: { action: string; element: Persona }): void {
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
export { Persona };

