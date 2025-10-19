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
import { CompaniaForm } from './dialogs/compania-form/compania-form';

// Definición de la Interfaz Compañía 
export interface Compania {
    iIdCompania: number;
    vCodigo: string;
    vRUC: string;
    vRazonSocial: string;
    bActivo: boolean;
    vDireccion: string;
}

// Datos de ejemplo
const ELEMENT_DATA: Compania[] = [
    { iIdCompania: 1, vCodigo: '001', vRUC: '20123456781', vRazonSocial: 'Soluciones Globales S.A.C.', bActivo: true, vDireccion: 'Av. Javier Prado 123' },
    { iIdCompania: 2, vCodigo: '002', vRUC: '20987654321', vRazonSocial: 'Tecnología Integral E.I.R.L.', bActivo: false, vDireccion: 'Jr. Los Girasoles 456' },
    { iIdCompania: 3, vCodigo: '003', vRUC: '10112233445', vRazonSocial: 'Inversiones Omega', bActivo: true, vDireccion: 'Calle Falsa 123' },
];

@Component({
    selector: 'app-compania-page',
    standalone: true, 
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
    templateUrl: './compania-page.html',
    styleUrl: './compania-page.scss'
})
export class CompaniaPage {
    // Columnas que se mostrarán.
   
    aDisplayedColumns: string[] = ['select', 'codigo', 'ruc', 'razonSocial', 'direccion', 'estado', 'actions'];

    // Datos para la tabla
    data: Compania[] = ELEMENT_DATA;

    // Modelo de selección para los checkboxes
    selection = new SelectionModel<Compania>(true, []);

    // Definición de las acciones para la botonera
    companiaActions: TableAction[] = [
        { name: 'edit', label: 'Editar Compañía', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Compañía', icon: 'delete' },
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
    onActionClicked(event: { action: string, element: Compania }): void {
        switch (event.action) {
            case 'edit':
                // Lógica para editar la compañía
                this.onEditCompania(event.element);
                break;
            case 'delete':
                // Lógica para eliminar la compañía
                this.onDeleteCompania(event.element);
                break;
        }
    }

    onAddCompania(): void {
        
        const dialogRef = this.dialog.open(CompaniaForm, {
            width: '500px',
            disableClose: true,
            data: {} // Compañía nueva
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Nueva compania a crear:', result);
                alert('Compañía creada (simulado)');
            }
        });
    }

    onEditCompania(compania: Compania): void {
        const dialogRef = this.dialog.open(CompaniaForm, {
            width: '500px',
            disableClose: true,
            data: { compania: compania } // Pasamos los datos de la compañía para editar
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Compania a actualizar:', result);
                alert(`Editando a ${compania.vRazonSocial}`);
            }
        });
    }

    onDeleteCompania(compania: Compania): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de que deseas eliminar la compañía "${compania.vRazonSocial}"?`,
                mostrarCampoObservacion: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Observación:', result.observacion);
                alert(`Eliminando a ${compania.vRazonSocial} por: ${result.observacion}`);
            }
        });
    }
}
