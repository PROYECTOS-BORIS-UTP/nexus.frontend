import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

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
  imports: [MatTableModule],
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
  ];
  dataSource = ELEMENT_DATA;

  clickedRows = new Set<Usuario>();

  toggleRow(row: Usuario) {
    if (this.clickedRows.has(row)) {
      this.clickedRows.delete(row); //  Quita si ya estaba seleccionado
    } else {
      this.clickedRows.add(row); // Agrega si no estaba
    }
  }
}
