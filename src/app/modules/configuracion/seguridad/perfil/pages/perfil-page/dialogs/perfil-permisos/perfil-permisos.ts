import { Component, inject, signal } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, tap, catchError, of, finalize, takeUntil } from 'rxjs';
import { IPerfilOpcionCreateRequest } from '../../../../interfaces/request/IPerfilOpcionCreateRequest.interface';
import { IPerfilOpcionCreateResponse } from '../../../../interfaces/response/IPerfilOpcionCreateResponse.interface';
import { IPerfilOpcionListadoResponse } from '../../../../interfaces/response/IPerfilOpcionListadoResponse.interface';
import { PerfilService } from '../../../../services/perfil.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutService } from '../../../../../../../../layout/services/layout';

export interface PerfilPermisosData {
	iIdPerfil: number;
	vPerfilNombre: string;
}

// --- Interface interna para el Stack de Navegación ---
interface INavigationLevel {
	iIdOpcionP: number | null; // ID del padre que se está mostrando
	vOpcion: string; // Nombre del padre (para el título)
}

@Component({
	selector: 'app-perfil-permisos',
	imports: [
		CommonModule,
		FormsModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatCheckboxModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
	],
	templateUrl: './perfil-permisos.html',
	styleUrl: './perfil-permisos.scss'
})
export class PerfilPermisos {
	// #region Inyección de Dependencias
	public data: PerfilPermisosData = inject(MAT_DIALOG_DATA);
	private dialogRef = inject(MatDialogRef<PerfilPermisos>);
	private perfilService = inject(PerfilService);
	private snackBar = inject(MatSnackBar);
	private layoutService = inject(LayoutService);
	// #endregion

	// #region Estado del Componente
	isLoading = signal(true);
	isSaving = signal(false);

	private allOpciones: IPerfilOpcionListadoResponse[] = []; // Almacén local de opciones
	private destroy$ = new Subject<void>();

	// Pila para guardar el historial (ej: [Módulos, Almacén, Mantenimiento])
	public navigationStack: INavigationLevel[] = [];
	// Opciones que se muestran en la columna actual
	public currentOptions: IPerfilOpcionListadoResponse[] = [];
	// Título de la columna actual
	public currentTitle = signal('');
	// #endregion

	// #region Ciclo de Vida
	ngOnInit(): void {
		if (!this.data.iIdPerfil) {
			this.showSnackbar('No se proporcionó un ID de perfil.', 'snackbar-error');
			this.dialogRef.close();
			return;
		}
		this.loadAllOptions();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
	// #endregion

	// #region Carga y Navegación
	/*
	 * Carga TODAS las opciones del perfil UNA SOLA VEZ.
	 */
	private loadAllOptions(): void {
		this.isLoading.set(true);
		this.perfilService.listarOpcionesPorPerfil(this.data.iIdPerfil).pipe(
			tap((response) => {
				this.allOpciones = response;
				// Inicializa la navegación en el nivel raíz
				this.navigateToLevel({ iIdOpcionP: null, vOpcion: 'Módulos Principales' });
			}),
			catchError((error) => {
				this.showSnackbar(error.message || 'Error al cargar permisos.', 'snackbar-error');
				this.dialogRef.close();
				return of(null);
			}),
			finalize(() => this.isLoading.set(false)),
			takeUntil(this.destroy$)
		).subscribe();
	}

	/*
	 * Muestra las opciones para un nivel de navegación específico.
	 */
	private displayCurrentLevel(): void {
		const currentLevel = this.navigationStack[this.navigationStack.length - 1];

		// Actualiza el título
		const levelIndex = this.navigationStack.length - 1;
		if (levelIndex === 0) {
			this.currentTitle.set(currentLevel.vOpcion);
		} else {
			this.currentTitle.set(`NIVEL ${levelIndex + 1} - ${currentLevel.vOpcion.toUpperCase()}`);
		}

		// Filtra las opciones para el nivel actual
		this.currentOptions = this.allOpciones.filter(
			(opcion) => opcion.iIdOpcionP === currentLevel.iIdOpcionP
		);
	}

	/*
	 * Navega a un nivel más profundo (muestra los hijos de la opción).
	 */
	private navigateToLevel(level: INavigationLevel): void {
		this.navigationStack.push(level);
		this.displayCurrentLevel();
	}

	/*
	 * Se ejecuta al seleccionar una opción.
	 * Si la opción tiene hijos, navega hacia ellos.
	 */
	public onSelectOption(option: IPerfilOpcionListadoResponse): void {
		// Verifica si esta opción tiene hijos en la lista original
		if (this.hasChildren(option)) {
			this.navigateToLevel({ iIdOpcionP: option.iIdOpcion, vOpcion: option.vOpcion });
		}
		// Si no tiene hijos, el clic no hace nada (solo los checkboxes funcionan)
	}

	/*
	 * Regresa al nivel anterior en la pila de navegación.
	 */
	public onGoBack(): void {
		if (this.navigationStack.length > 1) {
			this.navigationStack.pop();
			this.displayCurrentLevel();
		}
	}

	/**
	 * Helper para el HTML: decide si se muestra el botón de "Volver".
	 */
	public showBackButton(): boolean {
		return this.navigationStack.length > 1;
	}

	/*
	 * Helper para el HTML: decide si una opción tiene hijos.
	 */
	public hasChildren(option: IPerfilOpcionListadoResponse): boolean {
		// Busca en la lista completa si alguna opción tiene a esta como padre
		return this.allOpciones.some(op => op.iIdOpcionP === option.iIdOpcion);
	}
	// #endregion

	// #region Manejo de Permisos
	/*
	 * Se llama cuando el valor de cualquier checkbox cambia.
	 */
	onPermisoChange(
		node: IPerfilOpcionListadoResponse,
		tipo: 'bAcceso_visualizar' | 'bAcceso_crear' | 'bAcceso_actualizar' | 'bAcceso_eliminar',
		event: MatCheckboxChange
	): void {

		node[tipo] = event.checked;

		const request: IPerfilOpcionCreateRequest = {
			iIdPerfil: this.data.iIdPerfil,
			iIdOpcion: node.iIdOpcion,
			bAcceso_visualizar: node.bAcceso_visualizar,
			bAcceso_crear: node.bAcceso_crear,
			bAcceso_actualizar: node.bAcceso_actualizar,
			bAcceso_eliminar: node.bAcceso_eliminar,
		};

		this.isSaving.set(true);
		this.perfilService.guardarPermiso(request).pipe(
			tap((response: IPerfilOpcionCreateResponse) => {
				if (response.bStatus) {
					this.showSnackbar('Permiso actualizado', 'snackbar-success', 2000);
					this.layoutService.reloadMenu().subscribe();
				} else {
					this.showSnackbar(response.vMensaje || 'Error al guardar', 'snackbar-error');
					node[tipo] = !event.checked;
				}
			}),
			catchError((error) => {
				this.showSnackbar(error.message, 'snackbar-error');
				node[tipo] = !event.checked;
				return of(null);
			}),
			finalize(() => this.isSaving.set(false)),
			takeUntil(this.destroy$)
		).subscribe();
	}
	// #endregion

	// #region Utilidades
	private showSnackbar(
		message: string,
		panelClass: string,
		duration: number = 3000
	): void {
		this.snackBar.open(message, 'Cerrar', {
			duration: duration,
			panelClass: [panelClass],
		});
	}
	// #endregion
}
