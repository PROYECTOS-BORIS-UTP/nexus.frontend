import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EstadoUsuario } from './components/estado-usuario/estado-usuario';
import { PerfilUsuario } from './components/perfil-usuario/perfil-usuario';

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
    { iIdUsuario: 4, vNombreCompleto: 'Lucía Mendoza', vEmail: 'lucia.mendoza@example.com', dFechaCreacion: '11 Ago, 2021', aPerfiles: [PERFILES.G_FINANZAS, PERFILES.ADMIN], oEstado: { iIdEstado: 1, vNombreEstado: 'Activo' }},
    { iIdUsuario: 5, vNombreCompleto: 'Javier Roca', vEmail: 'javier.roca@example.com', dFechaCreacion: '28 Mar, 2022', aPerfiles: [PERFILES.J_CERT], oEstado: { iIdEstado: 3, vNombreEstado: 'Pendiente' } },
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
	],
	templateUrl: './usuario-page.html',
	styleUrl: './usuario-page.scss'
})
export class UsuarioPage {

	aDisplayedColumns: string[] = ['select', 'nombre', 'email', 'fechaCreacion', 'perfil', 'estado'];
    oDataSource = new MatTableDataSource<Usuario>(ELEMENT_DATA);
    oSelection = new SelectionModel<Usuario>(true, []);

    @ViewChild(MatSort) oSort!: MatSort;
    @ViewChild(MatPaginator) oPaginator!: MatPaginator;

	ngAfterViewInit() {
        this.oDataSource.sort = this.oSort;
        this.oDataSource.paginator = this.oPaginator;
    }

    applyFilter(event: Event) {
        const vFilterValue = (event.target as HTMLInputElement).value;
        this.oDataSource.filter = vFilterValue.trim().toLowerCase();
        if (this.oDataSource.paginator) {
            this.oDataSource.paginator.firstPage();
        }
    }

    isAllSelected() {
        const iNumSelected = this.oSelection.selected.length;
        const iNumRows = this.oDataSource.data.length;
        return iNumSelected === iNumRows;
    }

    toggleAllRows() {
        this.isAllSelected() ?
            this.oSelection.clear() :
            this.oDataSource.data.forEach(row => this.oSelection.select(row));
    }
}