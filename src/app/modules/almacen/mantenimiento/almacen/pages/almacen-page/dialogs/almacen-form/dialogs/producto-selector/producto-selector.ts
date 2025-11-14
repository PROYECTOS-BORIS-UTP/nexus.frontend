import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { debounceTime } from 'rxjs';
import { IProductoCatalogo } from '../interfaces/IProductoCatalogo.interface';

@Component({
	selector: 'app-producto-selector',
	imports: [
		CommonModule, MatDialogModule, MatButtonModule, MatTableModule,
		MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule
	],
	templateUrl: './producto-selector.html',
	styleUrl: './producto-selector.scss'
})
export class ProductoSelector {
	dialogRef = inject(MatDialogRef<ProductoSelector>);

	// Datos
	dataSource = new MatTableDataSource<IProductoCatalogo>([]);
	selection = new SelectionModel<IProductoCatalogo>(true, []); // 'true' permite múltiple selección
	displayedColumns = ['select', 'vCodigo', 'vDescripcion', 'vUnidadMedida', 'vCategoria'];

	// Filtro
	searchControl = new FormControl('');
	isLoading = signal(false);

	// Datos simulados (Aquí llamarías a tu ProductoService.listarCatalogo())
	listaMaestra: IProductoCatalogo[] = [
		{ iIdProducto: 10, vCodigo: 'LP-001', vDescripcion: 'Laptop Lenovo Thinkpad', vUnidadMedida: 'UND', iIdUnidadMedida: 1, vCategoria: 'Tecnología' },
		{ iIdProducto: 11, vCodigo: 'PAP-002', vDescripcion: 'Papel Bond A4 75gr', vUnidadMedida: 'MILLAR', iIdUnidadMedida: 3, vCategoria: 'Útiles' },
		{ iIdProducto: 12, vCodigo: 'TON-003', vDescripcion: 'Toner HP 85A', vUnidadMedida: 'UND', iIdUnidadMedida: 1, vCategoria: 'Suministros' },
		{ iIdProducto: 13, vCodigo: 'GUA-004', vDescripcion: 'Guantes de Seguridad', vUnidadMedida: 'PAR', iIdUnidadMedida: 2, vCategoria: 'EPP' },
		{ iIdProducto: 14, vCodigo: 'CAS-005', vDescripcion: 'Casco Industrial Amarillo', vUnidadMedida: 'UND', iIdUnidadMedida: 1, vCategoria: 'EPP' },
	];

	ngOnInit(): void {
		this.cargarProductos();

		// Filtro reactivo
		this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(val => {
			this.dataSource.filter = val?.trim().toLowerCase() || '';
		});
	}

	cargarProductos() {
		this.isLoading.set(true);
		// Simulación de API
		setTimeout(() => {
			this.dataSource.data = this.listaMaestra;
			this.isLoading.set(false);
		}, 300);
	}

	// #region Lógica de Selección
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length; // Ojo: data filtrada sería this.dataSource.filteredData.length
		return numSelected === numRows;
	}

	toggleAllRows() {
		if (this.isAllSelected()) {
			this.selection.clear();
			return;
		}
		this.selection.select(...this.dataSource.data);
	}
	// #endregion

	agregarSeleccionados() {
		// Cerramos el diálogo y devolvemos los objetos seleccionados
		this.dialogRef.close(this.selection.selected);
	}
}
