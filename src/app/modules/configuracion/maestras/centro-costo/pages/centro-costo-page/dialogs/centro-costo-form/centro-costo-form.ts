import { CommonModule } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { finalize, catchError, of } from 'rxjs';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { CompaniaService } from '../../../../../compania/services/compania.service';
import { ICentroCostoCreateUpdateRequest } from '../../../../interfaces/request/ICentroCostoCreateUpdateRequest.interface';
import { CentroCostoService } from '../../../../services/centro-costo.service';
import { ICentroCostoResponse } from '../../../../interfaces/response/ICentroCostoResponse.interface';

export interface CentroCostoFormData {
	centroCosto?: ICentroCostoResponse;
}

@Component({
	selector: 'app-centro-costo-form',
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
		MatIconModule
	],
	templateUrl: './centro-costo-form.html',
	styleUrl: './centro-costo-form.scss'
})
export class CentroCostoForm {
	// #region Inyecciones y Dependencias
	private fb = inject(FormBuilder);
	private centroCostoService = inject(CentroCostoService);
	private companiaService = inject(CompaniaService); // Inyectamos servicio de Compañía
	private snackBar = inject(MatSnackBar);
	public dialogRef = inject(MatDialogRef<CentroCostoForm>);
	// #endregion

	// #region Estado del Componente
	form: FormGroup;
	isEdit = signal(false);
	isLoading = signal(false);
	// #endregion

	// #region Datos (Selects)
	isLoadingCompanias = signal(false);
	selectCompanias = signal<ISelectItem[]>([]);
	// #endregion

	constructor(@Inject(MAT_DIALOG_DATA) public data: CentroCostoFormData) {
		this.isEdit.set(!!data.centroCosto);

		this.form = this.fb.group({
			iIdCentroCosto: [0],
			iIdCompania: [null, [Validators.required, Validators.min(1)]],
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vNombre: ['', [Validators.required, Validators.maxLength(255)]],
			bActivo: [true, [Validators.required]]
		});
	}

	ngOnInit(): void {
		// Cargar Compañías
		this.cargarCompanias();

		if (this.isEdit() && this.data.centroCosto) {
			const cc = this.data.centroCosto;
			this.form.patchValue({
				iIdCentroCosto: cc.iIdCentroCosto,
				iIdCompania: cc.iIdCompania,
				vCodigo: cc.vCodigo,
				vNombre: cc.vNombre,
				bActivo: cc.bActivo
			});
		}
	}

	// #region Carga de Datos (Selects)
	cargarCompanias(): void {
		this.isLoadingCompanias.set(true);
		this.companiaService.listarCompanias({ iPageNumber: 1, iPageSize: 1000, bActivo: true }).pipe(
			finalize(() => this.isLoadingCompanias.set(false))
		).subscribe({
			next: (response) => {
				this.selectCompanias.set(response.aRecords.map(c => ({
					iIdElemento: c.iIdCompania,
					vDescripcion: c.vRazonSocial
				})));
			},
			error: (err) => {
				console.error('Error cargando compañías', err);
			}
		});
	}
	// #endregion

	// #region Acciones del Diálogo
	onSave(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			this.snackBar.open('Por favor, complete los campos requeridos.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
			return;
		}

		this.isLoading.set(true);
		const request = this.form.value as ICentroCostoCreateUpdateRequest;

		this.centroCostoService.crearActualizarCentroCosto(request).pipe(
			finalize(() => this.isLoading.set(false)),
			catchError(error => of(null))
		).subscribe(response => {
			if (response && response.bStatus) {
				this.snackBar.open(response.vMensaje, 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.dialogRef.close(true);
			}
		});
	}

	onClose(): void {
		this.dialogRef.close(false);
	}
	// #endregion
}
