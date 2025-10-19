import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableGeneric, TableAction } from '../../../../../../common/components/table-generic/table-generic';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { PersonaForm } from './dialogs/persona-form/persona-form';
import { EstadoPersona } from "./components/estado-persona/estado-persona";

// Definición de la Interfaz Compañía 
export interface Persona {
    iIdPersona: number;
    vNombreCompleto: string;
    vDNI: string;
    dFechaNacimiento: Date;
    vCorreo: string;
    vCelular1: String;
    bActivo: { iIdEstado: number, vNombreEstado: 'Activo' | 'Inactivo'};

}

// Datos de ejemplo
const ELEMENT_DATA: Persona[] = [
  {
    iIdPersona: 1,
    vNombreCompleto: 'Juan Rodriguez',
    vDNI: '78452691',
    dFechaNacimiento: new Date('1985-05-15'),
    vCorreo: 'juanrodri@gmail.com',
    vCelular1: '989412434',
    bActivo: { iIdEstado: 2, vNombreEstado: 'Inactivo' },
  },
  {
    iIdPersona: 2,
    vNombreCompleto: 'Lucero Mendoza',
    vDNI: '12525412',
    dFechaNacimiento: new Date('1975-09-25'),
    vCorreo: 'lucero.mendoza@gmail.com',
    vCelular1: '987654321',
    bActivo: { iIdEstado: 1, vNombreEstado: 'Activo' },
  },
  {
    iIdPersona: 3,
    vNombreCompleto: 'Tito Lara',
    vDNI: '26343249',
    dFechaNacimiento: new Date('1999-12-11'),
    vCorreo: 'tito.lara@gmail.com',
    vCelular1: '944123987',
    bActivo: { iIdEstado: 2, vNombreEstado: 'Inactivo' },
  },
  {
    iIdPersona: 4,
    vNombreCompleto: 'Miguel Ignacio',
    vDNI: '21425446',
    dFechaNacimiento: new Date('2000-05-10'),
    vCorreo: 'miguel.ignacio@gmail.com',
    vCelular1: '955321654',
    bActivo: { iIdEstado: 2, vNombreEstado: 'Inactivo' },
  },
  {
    iIdPersona: 5,
    vNombreCompleto: 'Michael Jackson',
    vDNI: '11346374',
    dFechaNacimiento: new Date('1980-08-19'),
    vCorreo: 'michael.jackson@gmail.com',
    vCelular1: '912345678',
    bActivo: { iIdEstado: 1, vNombreEstado: 'Activo' },
  },
];


@Component({
    selector: 'app-compania-page',
    standalone: true, 
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
    EstadoPersona
],
    templateUrl: './persona-page.html',
    styleUrl: './persona-page.scss'
})
export class PersonaPage {
// Columnas que se mostrarán.
   
    aDisplayedColumns: string[] = ['select', 'nombrecompleto', 'dni', 'fechaNacimiento', 'correo', 'celular','estado'];

    // Datos para la tabla
    data: Persona[] = ELEMENT_DATA;

    // Modelo de selección para los checkboxes
    selection = new SelectionModel<Persona>(true, []);

    // Definición de las acciones para la botonera
    personaActions: TableAction[] = [
        { name: 'edit', label: 'Editar Persona', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Persona', icon: 'delete' },
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
    onActionClicked(event: { action: string, element:Persona }): void {
        switch (event.action) {
            case 'edit':
                // Lógica para editar la compañía
                this.onEditPersona(event.element);
                break;
            case 'delete':
                // Lógica para eliminar la compañía
                this.onDeletePersona(event.element);
                break;
        }
    }

    onAddPersona(): void {
        
        const dialogRef = this.dialog.open(PersonaForm, {
            width: '500px',
            disableClose: true,
            data: {} // Compañía nueva
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Nueva persona a crear:', result);
                alert('Persona creada (simulado)');
            }
        });
    }

    onEditPersona(persona: Persona): void {
        const dialogRef = this.dialog.open(PersonaForm, {
            width: '500px',
            disableClose: true,
            data: { persona: persona } // Pasamos los datos de la compañía para editar
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Persona a actualizar:', result);
                alert(`Editando a ${persona.vDNI}`);
            }
        });
    }

    onDeletePersona(compania: Persona): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de que deseas eliminar la compañía "${compania.vDNI}"?`,
                mostrarCampoObservacion: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Observación:', result.observacion);
                alert(`Eliminando a ${compania.vDNI} por: ${result.observacion}`);
            }
        });
    }
}
