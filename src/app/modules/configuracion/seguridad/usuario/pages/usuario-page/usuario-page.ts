
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { EstadoUsuario } from './components/estado-usuario/estado-usuario';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';
import { TableAction, TableGeneric } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { UsuarioForm } from './dialogs/usuario-form/usuario-form';

// Interfaces actualizadas
export interface Perfil {
    iIdPerfil: number;
    vNombrePerfil: string;
    vInicialesPerfil: string;
    vColorPerfil: string;
}

// Datos de Perfiles definidos
const PERFILES = {
    ADMIN: { iIdPerfil: 1, vNombrePerfil: 'Administrador', vInicialesPerfil: 'AD', vColorPerfil: '#6f42c1' },
    G_COMERCIAL: { iIdPerfil: 2, vNombrePerfil: 'Gerente Comercial', vInicialesPerfil: 'GC', vColorPerfil: '#ff8a80' },
    G_FINANZAS: { iIdPerfil: 3, vNombrePerfil: 'Gerente Finanzas', vInicialesPerfil: 'GF', vColorPerfil: '#8c9eff' },
    J_ALMACEN: { iIdPerfil: 4, vNombrePerfil: 'Jefe Almacén', vInicialesPerfil: 'JA', vColorPerfil: '#b9f6ca' },
    J_CERT: { iIdPerfil: 5, vNombrePerfil: 'Jefe Certificación', vInicialesPerfil: 'JC', vColorPerfil: '#ffc107' },
    J_LOGISTICA: { iIdPerfil: 6, vNombrePerfil: 'Jefe Logística', vInicialesPerfil: 'JL', vColorPerfil: '#f57f17' },
};

export interface Usuario {
    iIdUsuario: number;
    vNombreCompleto: string;
    vEmail: string;
    dFechaCreacion: string;
    aPerfiles: Perfil[]; // aRoles -> aPerfiles
    oEstado: { iIdEstado: number, vNombreEstado: 'Activo' | 'Inactivo' | 'Pendiente' };
}

// Datos de ejemplo actualizados
const ELEMENT_DATA: Usuario[] = [
    { iIdUsuario: 1, vNombreCompleto: 'Boris Gonzales', vEmail: 'boris.gonzales@example.com', dFechaCreacion: '15 Sep, 2023', aPerfiles: [PERFILES.ADMIN], oEstado: { iIdEstado: 1, vNombreEstado: 'Activo' } },
    { iIdUsuario: 2, vNombreCompleto: 'Ana García', vEmail: 'ana.garcia@example.com', dFechaCreacion: '20 Oct, 2022', aPerfiles: [PERFILES.G_COMERCIAL], oEstado: { iIdEstado: 1, vNombreEstado: 'Activo' } },
    { iIdUsuario: 3, vNombreCompleto: 'Carlos Torres', vEmail: 'carlos.torres@example.com', dFechaCreacion: '05 Ene, 2023', aPerfiles: [PERFILES.J_ALMACEN, PERFILES.J_LOGISTICA], oEstado: { iIdEstado: 2, vNombreEstado: 'Inactivo' } },
    { iIdUsuario: 4, vNombreCompleto: 'Lucía Mendoza', vEmail: 'lucia.mendoza@example.com', dFechaCreacion: '11 Ago, 2021', aPerfiles: [PERFILES.G_FINANZAS, PERFILES.ADMIN], oEstado: { iIdEstado: 1, vNombreEstado: 'Activo' } },
    { iIdUsuario: 5, vNombreCompleto: 'Javier Roca', vEmail: 'javier.roca@example.com', dFechaCreacion: '28 Mar, 2022', aPerfiles: [PERFILES.J_CERT], oEstado: { iIdEstado: 3, vNombreEstado: 'Pendiente' } },
];


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
        , EstadoUsuario
        , PerfilUsuario
        , TableGeneric
        , MatDialogModule
    ],
    templateUrl: './usuario-page.html',
    styleUrl: './usuario-page.scss'
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
    // Columnas que se mostrarán (sin la de acciones)
    aDisplayedColumns: string[] = ['select', 'nombre', 'email', 'fechaCreacion', 'perfil', 'estado'];

    // Datos para la tabla
    data: Usuario[] = ELEMENT_DATA;

    // Modelo de selección para los checkboxes
    selection = new SelectionModel<Usuario>(true, []);

    // Definición de las acciones para la botonera
    userActions: TableAction[] = [
        { name: 'edit', label: 'Editar Usuario', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Usuario', icon: 'delete' },
    ];


    constructor(public dialog: MatDialog) { }

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
    onActionClicked(event: { action: string, element: Usuario }): void {
        switch (event.action) {
            case 'edit':
                // Lógica para editar el usuario...
                this.onEditUser(event.element);
                break;
            case 'delete':
                // Lógica para eliminar el usuario...
                this.onDeleteUser(event.element);
                break;
        }
    }

    onAddUser(): void {
        const dialogRef = this.dialog.open(UsuarioForm, {
            width: '500px',
            disableClose: true, // Evita que se cierre al hacer clic afuera
            data: {} // No pasamos datos de usuario porque es nuevo
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Nuevo usuario a crear:', result);
                // AQUÍ VA TU LÓGICA:
                // 1. Llama a tu servicio para guardar el nuevo usuario en el backend.
                // 2. Si es exitoso, actualiza la tabla (this.data).
                alert('Usuario creado (simulado)');
            }
        });
    }

    onEditUser(usuario: Usuario): void {
        const dialogRef = this.dialog.open(UsuarioForm, {
            width: '500px',
            disableClose: true,
            data: { usuario: usuario } // Pasamos los datos del usuario para llenar el form
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Usuario a actualizar:', result);
                // AQUÍ VA TU LÓGICA:
                // 1. Llama a tu servicio para actualizar el usuario en el backend.
                // 2. Si es exitoso, actualiza la fila correspondiente en la tabla.
                alert(`Editando a ${usuario.vNombreCompleto}`);
            }
        });
    }

    onDeleteUser(usuario: Usuario): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de que deseas eliminar a "${usuario.vNombreCompleto}"?`,
                mostrarCampoObservacion: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Observación:', result.observacion);
                // AQUÍ VA TU LÓGICA:
                // 1. Llama a tu servicio para eliminar el usuario, pasando el ID y la observación.
                // 2. Si es exitoso, quita el elemento de la tabla.
                alert(`Eliminando a ${usuario.vNombreCompleto} por: ${result.observacion}`);
            }
        });
    }
}
