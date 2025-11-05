import { Component, inject } from '@angular/core';
import { IPaginationRequest } from '../../../../../../core/interfaces/IPaginationRequest.interface';
import { IPaginationResponse } from '../../../../../../core/interfaces/IPaginationResponse.interface';
import { IOpcionListadoRequest } from '../../interfaces/request/IOpcionListadoRequest.interface';
import { IOpcionListadoResponse } from '../../interfaces/response/IOpcionListadoResponse.interface';
import { OpcionService } from '../../services/opcion.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IOpcionFormData, OpcionForm } from './dialogs/opcion-form/opcion-form';
import { MatSnackBar } from '@angular/material/snack-bar';

interface IOpcionColumn {
	title: string;
	options: IOpcionListadoResponse[];
	parentOption: IOpcionListadoResponse | null;
	activeOptionId: number | null;
}

@Component({
	selector: 'app-opcion-page',
	imports: [
		MatIconModule
		, MatDialogModule
		, MatButtonModule
		// , OpcionForm
	],
	templateUrl: './opcion-page.html',
	styleUrl: './opcion-page.scss'
})
export class OpcionPage {

	private opcionService = inject(OpcionService);
	private dialog = inject(MatDialog);
	private snackBar = inject(MatSnackBar);
	
	// Títulos para cada nivel de columna
	private columnTitles: string[] = ['NIVEL 1 - MENÚ', 'NIVEL 2', 'NIVEL 3'];
	// Arreglo que contendrá todas nuestras columnas
	public columns: IOpcionColumn[] = [];
	// Paginación base (pedimos 100 para traer todos los items de un nivel)
	private defaultPagination: IPaginationRequest = { iPageNumber: 1, iPageSize: 100 };

	ngOnInit(): void {
		this.loadOptions(null, 0);
	}

	/*
	 * Carga las opciones para una nueva columna.
	 * @param parentId El ID de la opción padre (null para el primer nivel).
	 * @param columnIndex El índice de la columna que se va a crear/actualizar.
	 * @param parentOption La opción que se seleccionó (para el título).
	 */
	private loadOptions(parentId: number | null, columnIndex: number, parentOption: IOpcionListadoResponse | null = null): void {

		const request: IOpcionListadoRequest = {
			...this.defaultPagination,
			iIdOpcionP: parentId,
			bActivo: true
		};

		this.opcionService.listarOpciones(request).subscribe({
			next: (response: IPaginationResponse<IOpcionListadoResponse>) => {
				const title = this.getTitle(columnIndex, parentOption);
				this.columns.splice(columnIndex);
				this.columns.push({
					title: title,
					options: response.aRecords,
					parentOption: parentOption,
					activeOptionId: null
				});
			},
			error: (err) => {
				console.error('Error al cargar opciones:', err);
				// Aquí podrías mostrar un toast o mensaje de error
			}
		});
	}

	/*
	 * Se ejecuta al seleccionar una opción.
	 * @param option La opción seleccionada.
	 * @param columnIndex El índice de la columna a la que pertenece la opción.
	 */
	public onSelectOption(option: IOpcionListadoResponse, columnIndex: number): void {
		// Marca la opción como activa en su columna
		this.columns[columnIndex].activeOptionId = option.iIdOpcion;

		// Carga las sub-opciones (hijos) en la siguiente columna
		this.loadOptions(option.iIdOpcion, columnIndex + 1, option);
	}

	/*
	 * Genera el título para una columna.
	 */
	private getTitle(index: number, parentOption: IOpcionListadoResponse | null): string {
		if (index === 0) {
			return this.columnTitles[0]; // 'OPCIONES PRINCIPALES'
		}

		const prefix = this.columnTitles[index] || 'MÁS OPCIONES';
		return `${prefix} - ${parentOption?.vOpcion || ''}`;
	}

	/*
	 * Verifica si una opción es la que está activa en la columna.
	 */
	public getIsActive(option: IOpcionListadoResponse, column: IOpcionColumn): boolean {
		return option.iIdOpcion === column.activeOptionId;
	}

	private refreshColumn(columnIndex: number): void {
		const column = this.columns[columnIndex];
		if (column) {
			this.loadOptions(column.parentOption?.iIdOpcion || null, columnIndex, column.parentOption);
		}
	}

	public onAddOption(column: IOpcionColumn, columnIndex: number): void {
		const iIdOpcionP = column.parentOption?.iIdOpcion || null;

		const dialogRef = this.dialog.open(OpcionForm, {
			width: '800px', // Ancho del modal
			data: {
				iIdOpcionP: iIdOpcionP // Pasamos el ID del padre
			} as IOpcionFormData
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === true) {
				// Si el modal se cerró con 'true' (guardado exitoso), refrescamos la columna
				this.refreshColumn(columnIndex);

				this.snackBar.open('Opción creada exitosamente.', 'OK', {
					duration: 3000,
					panelClass: 'success-snackbar' // (Opcional)
				});
			}
		});
	}

	public onEditOption(option: IOpcionListadoResponse, event: MouseEvent, columnIndex: number): void {
		event.stopPropagation(); // Evita que onSelectOption se dispare

		const dialogRef = this.dialog.open(OpcionForm, {
			width: '800px',
			data: {
				opcion: option, // Pasamos la opción completa a editar
				iIdOpcionP: option.iIdOpcionP
			} as IOpcionFormData
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result === true) {
				this.refreshColumn(columnIndex);
				// Opcional: Si la opción editada estaba activa, refresca la columna hija
				if (this.getIsActive(option, this.columns[columnIndex])) {
					this.refreshColumn(columnIndex + 1);
				}

				this.snackBar.open('Opción actualizada exitosamente.', 'OK', {
					duration: 3000,
					panelClass: 'success-snackbar'
				});
			}
		});
	}

	public onDeleteOption(option: IOpcionListadoResponse, event: MouseEvent, columnIndex: number): void {
		event.stopPropagation(); // Evita que onSelectOption se dispare

		// --- MEJORA: Usar MatDialog para confirmar ---
		// (Por ahora usamos confirm() para simplicidad)
		const confirmDelete = confirm(`¿Está seguro de que desea eliminar la opción "${option.vOpcion}"?`);

		if (confirmDelete) {
			this.opcionService.eliminarOpcion(option.iIdOpcion).subscribe({
				next: (response) => {
					console.log(response.vMensaje);

					// Si la opción eliminada era la activa, borra las columnas hijas
					if (this.getIsActive(option, this.columns[columnIndex])) {
						this.columns.splice(columnIndex + 1);
					}
					// Refresca la columna actual para quitar el item
					this.refreshColumn(columnIndex);
					this.snackBar.open(response.vMensaje || 'Opción eliminada.', 'OK', {
						duration: 3000,
						panelClass: 'success-snackbar'
					});
				},
				error: (err) => {
					console.error('Error al eliminar', err);
					this.snackBar.open(err.message || 'Error al eliminar la opción.', 'Cerrar', {
						duration: 5000,
						panelClass: 'error-snackbar'
					});
				}
			});
		}
	}
}