import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IUsuarioCreateUpdateRequest } from '../../../../interfaces/request/IUsuarioCreateUpdateRequest.interface';
import { IUsuarioResponse } from '../../../../interfaces/response/IUsuarioResponse.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { UsuarioService } from '../../../../services/usuario.service';
import { IUsuarioCreateUpdateResponse } from '../../../../interfaces/response/IUsuarioCreateUpdateResponse.interface';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PersonaService } from '../../../../../../maestras/persona/services/persona.service';
import { IPersonaListadoRequest } from '../../../../../../maestras/persona/interfaces/request/IPersonaListadoRequest.interface';
import { IElementoSistemaListadoPorCodigoRequest } from '../../../../../../maestras/elemento-sistema/interfaces/request/IElementoSistemaListadoPorCodigoRequest.interface';
import { ElementoSistemaService } from '../../../../../../maestras/elemento-sistema/services/elemento-sistema.service';


export interface UsuarioFormData {
	usuario?: IUsuarioResponse;
}

@Component({
	selector: 'app-usuario-form',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatIconModule,
		MatToolbarModule
	],
	templateUrl: './usuario-form.html',
	styleUrl: './usuario-form.scss'
})
export class UsuarioForm {
	// #region Inyecciones y Dependencias
	private fb = inject(FormBuilder);
	private usuarioService = inject(UsuarioService);
	private personaService = inject(PersonaService);
	private elementoSistemaService = inject(ElementoSistemaService);
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<UsuarioForm>);
	// #endregion

	// #region Estado del Componente
	form: FormGroup;
	isEdit = signal(false);
	isLoading = signal(false);
	hidePassword = signal(true); // Para mostrar/ocultar contraseña
	// #endregion

	// #region Datos (Selects) - Simulados
	isLoadingTipoPersona = false;

	selectTiposUsuario = signal<ISelectItem[]>([]);
	selectPersonas = signal<ISelectItem[]>([]);
	selectTipoPersona = signal<ISelectItem[]>([]);
	// #endregion

	constructor(@Inject(MAT_DIALOG_DATA) public data: UsuarioFormData) {
		this.isEdit.set(!!data.usuario);

		this.form = this.fb.group({
			iIdUsuario: [0],
			vUsuario: ['', [Validators.required, Validators.maxLength(50)]], // Ajusta maxLength según DB
			vPassword: [''], // Requerido solo en creación (validado manualmente)
			bActivo: [true, [Validators.required]],
			iIdTipoUsuario: [null, [Validators.required, Validators.min(1)]],
			iIdPersona: [null],
			iIdTipoPersona: [null, [Validators.required, Validators.min(1)]],
			bChangePassword: [false]
		});
	}

	ngOnInit(): void {
		if (this.isEdit() && this.data.usuario) {
			const u = this.data.usuario;
			this.form.patchValue({
				iIdUsuario: u.iIdUsuario,
				vUsuario: u.vUsuario,
				bActivo: u.bActivo,
				iIdTipoUsuario: u.iIdTipoUsuario,
				iIdPersona: u.iIdPersona,
				iIdTipoPersona: u.iIdTipoPersona,
				bChangePassword: u.bChangePassword || false,
				vPassword: null // No mostrar password al editar
			});

			// Si es edición, el password no es obligatorio a menos que se quiera cambiar
			this.form.get('vPassword')?.clearValidators();
			this.form.get('vPassword')?.updateValueAndValidity();
		} else {
			// Si es creación, el password es obligatorio
			this.form.get('vPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
			this.form.get('vPassword')?.updateValueAndValidity();
		}

		this.cargarDatosSelects();
	}

	// #region Carga de Datos (Selects)
	cargarDatosSelects(): void {
		// Simulación - REEMPLAZAR CON SERVICIOS REALES
		this.cargarTipoPersona();
		this.cargarPersonas();
	}

	cargarPersonas() {
		const request: IPersonaListadoRequest = {
			iPageNumber: 1,
			iPageSize: 100,
			bActivo: true
		};
		this.personaService.listarPersonas(request).subscribe({
			next: (response) => {
				if (response && response.aRecords) {
					const personas: ISelectItem[] = response.aRecords.map(p => ({
						iIdElemento: p.iIdPersona,
						vDescripcion: p.vNombreCompleto
					}));
					this.selectPersonas.set(personas);
				}
			},
			error: (err) => {
				console.error('Error al cargar personas', err);
				this.snackBar.open('Error al cargar lista de personas', 'Cerrar', { duration: 3000 });
			}
		});
	}

	cargarTipoPersona(): void {
		this.isLoadingTipoPersona = true;
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'TIPO_PERSONA' };

		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipoPersona = false)) // Asegura que el spinner se oculte
			.subscribe({
				next: (data) => {
					this.selectTipoPersona.set(
						data.map(comp => ({
							iIdElemento: comp.iIdElemento,
							vDescripcion: comp.vDescripcion
						}))
					);
				},
				error: (err) => {
					console.error('Error al cargar Tipos de Elemento:', err);
					this.selectTipoPersona.set([]);
				}
			});
	}
	// #endregion

	// #region Acciones
	onSave(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		const request = this.form.value as IUsuarioCreateUpdateRequest;

		// En edición, si el password está vacío, enviamos null o undefined para no actualizarlo
		if (this.isEdit() && !request.vPassword) {
			request.vPassword = null;
		}

		this.usuarioService.crearActualizarUsuario(request).pipe(
			finalize(() => this.isLoading.set(false)),
		).subscribe((response: IUsuarioCreateUpdateResponse) => {
			if (response && response.bStatus) {

				this.snackBar.open(response.vMensaje, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
				this.dialogRef.close(true);
			} else {
				const errorMsg = response?.vMensaje || 'Ocurrió un error inesperado';
				this.snackBar.open(errorMsg, 'Cerrar', { duration: 3000 });
			}
		});
	}

	onClose(): void {
		this.dialogRef.close(false);
	}
	// #endregion
}