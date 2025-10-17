
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


// Reutilizamos la constante de perfiles que ya tenías
const COMPANIA_OBJ = {
	ADMIN: { iIdPerfil: 1, vNombrePerfil: 'Administrador', vInicialesPerfil: 'AD', vColorPerfil: '#6f42c1' },
	G_COMERCIAL: { iIdPerfil: 2, vNombrePerfil: 'Gerente Comercial', vInicialesPerfil: 'GC', vColorPerfil: '#ff8a80' },
	G_FINANZAS: { iIdPerfil: 3, vNombrePerfil: 'Gerente Finanzas', vInicialesPerfil: 'GF', vColorPerfil: '#8c9eff' },
	J_ALMACEN: { iIdPerfil: 4, vNombrePerfil: 'Jefe Almacén', vInicialesPerfil: 'JA', vColorPerfil: '#b9f6ca' },
	J_CERT: { iIdPerfil: 5, vNombrePerfil: 'Jefe Certificación', vInicialesPerfil: 'JC', vColorPerfil: '#ffc107' },
	J_LOGISTICA: { iIdPerfil: 6, vNombrePerfil: 'Jefe Logística', vInicialesPerfil: 'JL', vColorPerfil: '#f57f17' },
};



@Component({
  selector: 'app-compania-page',
  imports: [],
  templateUrl: './compania-page.html',
  styleUrl: './compania-page.scss'
})
export class CompaniaPage {

}
