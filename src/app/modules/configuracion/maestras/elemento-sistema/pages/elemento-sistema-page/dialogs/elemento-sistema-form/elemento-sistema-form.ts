import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IElementoSistemaCreateUpdateRequest } from '../../../../interfaces/request/IElementoSistemaCreateUpdateRequest.interface';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ElementoSistemaService } from '../../../../services/elemento-sistema.service';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { IElementoSistemaListadoPorCodigoRequest } from '../../../../interfaces/request/IElementoSistemaListadoPorCodigoRequest.interface';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompaniaService } from '../../../../../compania/services/compania.service';
import { ICompaniaListadoRequest } from '../../../../../compania/interfaces/request/ICompaniaListadoRequest.interface';
import { PaisService } from '../../../../../pais/services/pais.service';
import { IPaisListadoRequest } from '../../../../../pais/interfaces/request/IPaisListadoRequest.interface';

export interface ElementoSistemaFormData {
	elemento: IElementoSistemaCreateUpdateRequest | null;
	idPadre?: number | null;
}

@Component({
	selector: 'app-elemento-sistema-form',
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDialogModule,
		MatCheckboxModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatProgressSpinnerModule
	],
	templateUrl: './elemento-sistema-form.html',
	styleUrls: ['./elemento-sistema-form.scss']
})
export class ElementoSistemaForm implements OnInit {

	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<ElementoSistemaForm>);
	private elementoSistemaService = inject(ElementoSistemaService);
	private companiaService = inject(CompaniaService);
	private paisService = inject(PaisService);

	elementoSistemaForm: FormGroup;
	tituloDialogo = 'Agregar Elemento del Sistema';
	public elementoExistente: IElementoSistemaCreateUpdateRequest | null = null;

	selectTipoElemento: ISelectItem[] = [];
	isLoadingTipos = false;
	// --- Placeholders para Selects (DEBES CARGARLOS DESDE SERVICIOS) ---
	selectCompanias: ISelectItem[] = []; // Usar ISelectItem si aplica
	selectPaises: ISelectItem[] = [];   // Usar ISelectItem si aplica
	isLoadingCompanias = false;
	isLoadingPaises = false;
	// --- Fin Placeholders ---

	private idPadreRecibido: number | null = null; // Variable para guardar el idPadre

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: ElementoSistemaFormData
	) {
		this.elementoExistente = data?.elemento;
		this.idPadreRecibido = data?.idPadre ?? null;

		this.elementoSistemaForm = this.fb.group({
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vAbreviatura: ['', [Validators.required, Validators.maxLength(50)]],
			vDescripcion: ['', [Validators.required, Validators.maxLength(250)]],
			iSubGrupo: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Asegura numérico
			bActivo: [true, Validators.required],
			iIdTipoElemento: [null, [Validators.required, Validators.min(1)]],
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			iIdPais: [null, [Validators.required, Validators.min(1)]]
		});
	}

	ngOnInit(): void {
		if (this.elementoExistente) {
			this.tituloDialogo = 'Editar Elemento del Sistema';
			// Asegúrate que el patchValue reciba los IDs correctos para los selects
			const patchData = {
				...this.elementoExistente,
				// Si iIdElementoPadre viene en elementoExistente y lo necesitas en el form, añádelo
			};
			this.elementoSistemaForm.patchValue(patchData);
		} else if (this.idPadreRecibido) {
			// Si se recibe idPadre al crear, podrías necesitarlo (ej, para preseleccionar algo o lógica adicional)
			// this.elementoSistemaForm.patchValue({ iIdElementoPadre: this.idPadreRecibido });
			console.log('Creando nuevo elemento hijo de:', this.idPadreRecibido);
		}

		// Cargar datos para los selects
		this.cargarTiposElemento();
		this.cargarCompanias();
		this.cargarPaises();
	}

	//#Region SELECT
	cargarTiposElemento(): void {
		this.isLoadingTipos = true;
		const request: IElementoSistemaListadoPorCodigoRequest = { vCodigoPadre: 'TIPO_ELEMENTO' };

		this.elementoSistemaService.listarPorCodigoPadre(request)
			.pipe(finalize(() => this.isLoadingTipos = false)) // Asegura que el spinner se oculte
			.subscribe({
				next: (data) => {
					this.selectTipoElemento = data;
				},
				error: (err) => {
					console.error('Error al cargar Tipos de Elemento:', err);
					// Aquí podrías mostrar un mensaje al usuario (ej: con MatSnackBar)
					this.selectTipoElemento = []; // Limpiar en caso de error
				}
			});
	}

	cargarCompanias(): void {
		this.isLoadingCompanias = true;
		const request: ICompaniaListadoRequest = {
			iPageNumber: 1,
			iPageSize: 1000,
		};

		this.companiaService.listarCompanias(request)
			.pipe(finalize(() => this.isLoadingCompanias = false))
			.subscribe({
				next: (paginatedResponse) => {
					this.selectCompanias = paginatedResponse.aRecords.map(comp => ({
						iIdElemento: comp.iIdCompania,
						vDescripcion: comp.vRazonSocial
					}));
				},
				error: (err) => {
					console.error('Error al cargar Compañías:', err);
					this.selectCompanias = [];
				}
			});
	}

	cargarPaises(): void {
		this.isLoadingPaises = true;
		const request: IPaisListadoRequest = {
			iPageNumber: 1,
			iPageSize: 1000,
		};

		this.paisService.listarPaises(request)
			.pipe(finalize(() => this.isLoadingPaises = false))
			.subscribe({
				next: (paginatedResponse) => {
					this.selectPaises = paginatedResponse.aRecords.map(pais => ({
						iIdElemento: pais.iIdPais,
						vDescripcion: pais.vNombre
					}));
				},
				error: (err) => {
					console.error('Error al cargar Países:', err);
					this.selectPaises = []; // Limpiar en caso de error
				}
			});
	}
	//#endregion

	//#endRegion

	onCancel(): void {
		this.dialogRef.close();
	}

	//#region ON SAVE
	onSave(): void {
		if (this.elementoSistemaForm.invalid) {
			this.elementoSistemaForm.markAllAsTouched();
			return;
		}

		const formData = this.elementoSistemaForm.getRawValue();
		const subGrupoNum = Number(formData.iSubGrupo);

		const dataToSend: IElementoSistemaCreateUpdateRequest = {
			...formData,
			iIdElemento: this.elementoExistente?.iIdElemento ?? 0,
			iIdElementoPadre: this.idPadreRecibido || null,
			iSubGrupo: isNaN(subGrupoNum) ? 0 : subGrupoNum,
		};

		// Limpieza de strings vacíos a null (opcional, si el backend lo requiere)
		for (const key in dataToSend) {
			if (Object.prototype.hasOwnProperty.call(dataToSend, key)) {
				const typedKey = key as keyof IElementoSistemaCreateUpdateRequest;
				const requiredFields: (keyof IElementoSistemaCreateUpdateRequest)[] = [
					'vCodigo', 'vAbreviatura', 'vDescripcion' // Añade otros strings requeridos si los hay
				];
				if (dataToSend[typedKey] === '' && !requiredFields.includes(typedKey)) {
					(dataToSend as any)[typedKey] = null;
				}
			}
		}


		this.dialogRef.close(dataToSend);
	}

	get fc() { return this.elementoSistemaForm.controls; }
}