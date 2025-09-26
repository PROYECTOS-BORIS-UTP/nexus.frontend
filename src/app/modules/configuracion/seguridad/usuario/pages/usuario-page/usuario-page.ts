import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';

export interface Usuario {
  idUsuario: number;
  vUsuario: string;
  bActivo: boolean;
  idTipoUsuario: number;
  idPersona: number | null;
  idTipoPersona: number;
  bChangePassword: boolean;
}

const ELEMENT_DATA: Usuario[] = [
  {
    idUsuario: 1,
    vUsuario: 'bestradas',
    bActivo: true,
    idTipoUsuario: 1,
    idPersona: null,
    idTipoPersona: 1,
    bChangePassword: false,
  },
  {
    idUsuario: 2,
    vUsuario: 'admin',
    bActivo: true,
    idTipoUsuario: 2,
    idPersona: 5,
    idTipoPersona: 1,
    bChangePassword: true,
  },
];

@Component({
  selector: 'app-usuario-page',
  imports: [MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './usuario-page.html',
  styleUrl: './usuario-page.scss',
})
export class UsuarioPage {
  displayedColumns: string[] = [
    'idUsuario',
    'vUsuario',
    'bActivo',
    'idTipoUsuario',
    'idPersona',
    'idTipoPersona',
    'bChangePassword',
    'acciones'
  ];
  dataSource = ELEMENT_DATA;

  clickedRows = new Set<Usuario>();

  editarUsuario(user: any) {
  console.log('Editando usuario:', user);

  // modal
}

  toggleRow(row: Usuario) {
    if (this.clickedRows.has(row)) {
      this.clickedRows.delete(row); //  Quita si ya estaba seleccionado
    } else {
      this.clickedRows.add(row); // Agrega si no estaba
    }
  }
}
