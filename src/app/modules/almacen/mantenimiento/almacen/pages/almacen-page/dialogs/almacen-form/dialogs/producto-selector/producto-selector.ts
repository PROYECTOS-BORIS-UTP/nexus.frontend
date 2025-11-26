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
import { debounceTime, forkJoin } from 'rxjs';
import { IProductoCatalogo } from '../interfaces/IProductoCatalogo.interface';
import { ProductoService } from '../../../../../../../../../logistica/mantenimiento/producto/services/producto.service';
import { UnidadMedidaService } from '../../../../../../../../../logistica/mantenimiento/unidad-medida/services/unidad-medida.service';
import { IProductoResponse } from '../../../../../../../../../logistica/mantenimiento/producto/interfaces/response/IProductoResponse.interface';
import { IUnidadMedidaResponse } from '../../../../../../../../../logistica/mantenimiento/unidad-medida/interfaces/response/IUnidadMedidaResponse.interface';

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

	productoService = inject(ProductoService);
	unidadMedidaService = inject(UnidadMedidaService);

	// Datos
	dataSource = new MatTableDataSource<IProductoCatalogo>([]);
	selection = new SelectionModel<IProductoCatalogo>(true, []); // 'true' permite múltiple selección
	displayedColumns = ['select', 'vCodigo', 'vDescripcion', 'vUnidadMedida', 'vCategoria'];

	// Filtro
	searchControl = new FormControl('');
	isLoading = signal(false);

	ngOnInit(): void {
		this.cargarProductos();

		// Filtro reactivo
		this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(val => {
			this.dataSource.filter = val?.trim().toLowerCase() || '';
		});
	}

	cargarProductos() {
		this.isLoading.set(true);

		forkJoin({
			productos: this.productoService.listarProductos({ iPageNumber: 1, iPageSize: 1000 }), // Traemos todos por ahora
			unidades: this.unidadMedidaService.listarUnidadesMedida({ iPageNumber: 1, iPageSize: 1000 })
		}).subscribe({
			next: (resp) => {
				const unidadesMap = new Map<number, string>();
				resp.unidades.aRecords.forEach((u: IUnidadMedidaResponse) => unidadesMap.set(u.iIdUnidadMedida, u.vAbreviatura || u.vDescripcion));

				const productosMapeados: IProductoCatalogo[] = resp.productos.aRecords.map((p: IProductoResponse) => ({
					iIdProducto: p.iIdProducto,
					vCodigo: p.vCodigo,
					vDescripcion: p.vTitulo, // Mapeamos vTitulo a vDescripcion
					vUnidadMedida: unidadesMap.get(p.iIdUnidadMedida) || 'UND',
					iIdUnidadMedida: p.iIdUnidadMedida,
					vCategoria: p.vFamiliaNombre
				}));

				this.dataSource.data = productosMapeados;
				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('Error al cargar catálogo:', err);
				this.isLoading.set(false);
			}
		});
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