import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, tap, catchError, of, finalize } from 'rxjs';
import { IPerfilUsuarioListadoRequest } from '../../../../../perfil/interfaces/request/IPerfilUsuarioListadoRequest.interface';
import { IPerfilResponse } from '../../../../../perfil/interfaces/response/IPerfilResponse.interface';
import { IPerfilUsuarioListadoResponse } from '../../../../../perfil/interfaces/response/IPerfilUsuarioListadoResponse.interface';
import { PerfilService } from '../../../../../perfil/services/perfil.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Layout } from '../../../../../../../../layout/services/layout';

// Datos que recibe el diálogo
export interface IAsignarPerfilesDialogData {
	iIdUsuario: number;
	iIdCompania: number;
	nombreUsuario: string;
}

@Component({
	selector: 'app-asignar-perfil',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatSelectModule,
		MatIconModule,
		MatListModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatToolbarModule,
        MatDividerModule,
        MatTooltipModule
	],
	templateUrl: './asignar-perfil.html',
	styleUrl: './asignar-perfil.scss'
})
export class AsignarPerfil {
	// #region Inyecciones y Datos
	public data: IAsignarPerfilesDialogData = inject(MAT_DIALOG_DATA);
	private dialogRef = inject(MatDialogRef<AsignarPerfil>);
	private perfilService = inject(PerfilService);
	private layoutService = inject(Layout);
	private snackBar = inject(MatSnackBar);
	private fb = inject(FormBuilder);
	// #endregion

	// #region Estado y Signals
	isLoading = signal(true);
	isSubmitting = signal(false); // Para deshabilitar botones al guardar/eliminar

	// Lista de perfiles que el usuario YA tiene
	assignedProfiles = signal<IPerfilUsuarioListadoResponse[]>([]);

	// Lista de TODOS los perfiles que existen en el sistema
	allProfiles = signal<IPerfilResponse[]>([]);

	// Lista de perfiles que se pueden asignar (Todos - Asignados)
	availableProfiles = computed(() => {
		const assignedIds = new Set(this.assignedProfiles().map(p => p.iIdPerfil));
		return this.allProfiles().filter(p => !assignedIds.has(p.iIdPerfil) && p.bActivo);
	});
	// #endregion

	// #region Formulario
	assignForm = this.fb.group({
		iIdPerfil: ['', [Validators.required]]
	});
	// #endregion

	ngOnInit(): void {
		this.loadAllData();
	}

	/**
	 * Carga simultáneamente los perfiles asignados y todos los perfiles.
	 */
	loadAllData(): void {
		this.isLoading.set(true);

		const listadoRequest: IPerfilUsuarioListadoRequest = {
			iIdUsuario: this.data.iIdUsuario,
			iIdCompania: this.data.iIdCompania,
			iPageNumber: 1,
			iPageSize: 1000 // Asumimos que un usuario no tendrá > 1000 perfiles
		};

		const allPerfilesRequest = {
			iPageNumber: 1,
			iPageSize: 1000, // Asumimos que no hay > 1000 perfiles en total
			bActivo: true
		};

		forkJoin({
			assigned: this.perfilService.listarPerfilesPorUsuario(listadoRequest),
			all: this.perfilService.listarPerfiles(allPerfilesRequest)
		}).pipe(
			tap(({ assigned, all }) => {
				this.assignedProfiles.set(assigned.aRecords);
				this.allProfiles.set(all.aRecords);
			}),
			catchError(error => {
				this.showSnackbar(error.message || 'Error al cargar datos de perfiles.', 'snackbar-error');
				this.dialogRef.close(false); // Cierra el diálogo si falla la carga inicial
				return of(null);
			}),
			finalize(() => this.isLoading.set(false))
		).subscribe();
	}

	/**
	 * Llama al servicio para asignar el perfil seleccionado.
	 */
	onAssignProfile(): void {
		if (this.assignForm.invalid || this.isSubmitting()) return;

		const iIdPerfil = this.assignForm.value.iIdPerfil;
		if (!iIdPerfil) return;

		this.isSubmitting.set(true);

		this.perfilService.asignarPerfilUsuario({
			iIdUsuario: this.data.iIdUsuario,
			iIdCompania: this.data.iIdCompania,
			iIdPerfil: Number(iIdPerfil)
		}).pipe(
			tap(response => {
				this.showSnackbar(response.vMensaje, 'snackbar-success');
				this.loadAllData(); // Recarga ambas listas
				this.assignForm.reset();
				this.layoutService.reloadMenu().subscribe();
			}),
			catchError(error => {
				this.showSnackbar(error.message, 'snackbar-error');
				return of(null);
			}),
			finalize(() => this.isSubmitting.set(false))
		).subscribe();
	}

	/**
	 * Llama al servicio para eliminar un perfil asignado.
	 */
	onDeleteAssignedProfile(iIdPerfil: number): void {
		if (this.isSubmitting()) return;

		this.isSubmitting.set(true);

		this.perfilService.eliminarPerfilUsuario(
			this.data.iIdUsuario,
			iIdPerfil,
			this.data.iIdCompania
		).pipe(
			tap(response => {
				this.showSnackbar(response.vMensaje, 'snackbar-warn');
				this.loadAllData();
				this.layoutService.reloadMenu().subscribe();
			}),
			catchError(error => {
				this.showSnackbar(error.message, 'snackbar-error');
				return of(null);
			}),
			finalize(() => this.isSubmitting.set(false))
		).subscribe();
	}

	onClose(): void {
		this.dialogRef.close();
	}

	private showSnackbar(message: string, panelClass: string): void {
		this.snackBar.open(message, 'Cerrar', {
			duration: 3000,
			panelClass: [panelClass]
		});
	}
}
