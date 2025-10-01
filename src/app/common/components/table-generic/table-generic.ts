import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterContentInit, AfterViewInit, Component, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource, MatColumnDef, MatTable } from '@angular/material/table';

export interface TableAction {
	name: string;      // Nombre interno, ej: 'edit'
	label: string;     // Texto que ve el usuario, ej: 'Editar'
	icon: string;      // Ícono de Material, ej: 'edit'
}

@Component({
	selector: 'app-table-generic',
	imports: [
		CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
		MatButtonModule, MatIconModule, MatMenuModule
	],
	templateUrl: './table-generic.html',
	styleUrl: './table-generic.scss'
})
export class TableGeneric implements OnChanges, AfterContentInit, AfterViewInit{
	@Input() data: any[] = [];
	@Input() displayedColumns: string[] = [];
	@Input() actions: TableAction[] = [];
	@Input() selection?: SelectionModel<any>;

	@Output() actionClicked = new EventEmitter<{ action: string, element: any }>();

	dataSource = new MatTableDataSource<any>();
	internalDisplayedColumns: string[] = [];

	@ViewChild(MatPaginator) paginator!: MatPaginator;
	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatTable, { static: true }) table!: MatTable<any>; // Referencia a la tabla

	@ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>; // Referencia a las columnas proyectadas

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['data']) {
			this.dataSource.data = this.data;
		}
		this.internalDisplayedColumns = this.actions.length > 0
			? [...this.displayedColumns, 'actions']
			: [...this.displayedColumns];
	}

	// Este hook se ejecuta cuando el contenido proyectado está listo.
	ngAfterContentInit(): void {
		// Registramos explícitamente cada definición de columna en la tabla.
		// ESTO RESUELVE EL ERROR "Could not find column with id".
		this.columnDefs.forEach(columnDef => {
			this.table.addColumnDef(columnDef);
		});
	}

	// Este hook se ejecuta cuando la vista del componente está lista.
	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	public applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	protected onActionClick(actionName: string, element: any): void {
		this.actionClicked.emit({ action: actionName, element: element });
	}
}
