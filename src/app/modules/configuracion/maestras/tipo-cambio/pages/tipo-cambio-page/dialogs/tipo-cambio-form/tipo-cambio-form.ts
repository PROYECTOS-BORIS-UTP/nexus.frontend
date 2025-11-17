import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ITipoCambioCreateUpdateRequest } from '../../../../interfaces/request/ITipoCambioCreateUpdateRequest.interface';
import { ISelectItem } from '../../../../../../../../core/interfaces/ISelectItem.interface';
import { MonedaService } from '../../../../../moneda/services/moneda.service';
import { IMonedaListadoRequest } from '../../../../../moneda/interfaces/request/IMonedaListadoRequest.interface';
import { finalize } from 'rxjs';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';


 export interface TipoCambioFormData {
  tipocambio: ITipoCambioCreateUpdateRequest| null;
 } 

@Component({
  selector: 'app-tipo-cambio-form',
  standalone: true,
  imports: [

    CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDialogModule,
		MatCheckboxModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
   
  ],
  templateUrl: './tipo-cambio-form.html',
  styleUrl: './tipo-cambio-form.scss'
})
export class TipoCambioForm {

	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<TipoCambioForm>);
  private monedaService = inject(MonedaService);


	tipocambioForm: FormGroup;
	tituloDialogo = 'Agregar Tipo de Cambio';
	public tipocambioExistente: ITipoCambioCreateUpdateRequest| null = null;



  selectMoneda: ISelectItem[] = [];
  isLoadingMoneda=false;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: TipoCambioFormData
	) {
		this.tipocambioExistente = data?.tipocambio;

		this.tipocambioForm = this.fb.group({
			iIdMonedaOrigen: ['', [Validators.required, Validators.maxLength(50)]],
			iIdMonedaDestino: ['', [Validators.required, Validators.maxLength(11),Validators.minLength(11) ]],
			dFecha: ['', [Validators.required, Validators.maxLength(250)]],
			dCompra: ['', [Validators.required, Validators.maxLength(50)]],
			dVenta: ['', [Validators.required, Validators.maxLength(250)]],
		});
	}

	ngOnInit(): void {
    if (this.tipocambioExistente) {
      this.tituloDialogo = 'Editar Tipo de Cambio';
      
      // 🚨 PUNTO DE CORRECCIÓN: Convertir el string dFecha a un objeto Date 
      const fechaParaFormulario = new Date(this.tipocambioExistente.dFecha);

      const patchData = {
        ...this.tipocambioExistente,
        dFecha: fechaParaFormulario // Usamos el objeto Date para que el MatDatepicker lo entienda
      };

      this.tipocambioForm.patchValue(patchData);
    } else {
      this.tituloDialogo = 'Crear Tipo de Cambio';
    }

    //CARGAR DATOS MONEDA
    this.cargarMoneda();
}

  cargarMoneda(): void {
      this.isLoadingMoneda = true;
      const request: IMonedaListadoRequest= {
        iPageNumber: 1,
        iPageSize: 1000,
      };
  
      this.monedaService.listarMonedas(request)
        .pipe(finalize(() => this.isLoadingMoneda= false))
        .subscribe({
          next: (paginatedResponse) => {
            this.selectMoneda= paginatedResponse.aRecords.map(mon=> ({
              iIdElemento: mon.iIdMoneda,
              vDescripcion: mon.vDescripcion
            }));
          },
          error: (err) => {
            console.error('Error al cargar Moneda:', err);
            this.selectMoneda= [];
          }
        });
    }

	//#Region SELECT

	//#endregion

	onCancel(): void {
		this.dialogRef.close();
	}
    


	//#region ON SAVE
// En tipo-cambio-form.ts
onSave(): void {
    if (this.tipocambioForm.invalid) { this.tipocambioForm.markAllAsTouched(); return; }

    const formData = this.tipocambioForm.getRawValue();

    // --- COMIENZA LA CONVERSIÓN DE FECHA ---
    let fechaParaAPI = formData.dFecha;

    if (fechaParaAPI instanceof Date && !isNaN(fechaParaAPI.getTime())) {
        // Convierte el objeto Date (que viene del Datepicker) 
        // a un string en formato YYYY-MM-DD para el backend.
        fechaParaAPI = fechaParaAPI.toISOString().split('T')[0];
    }
    // --- FINALIZA LA CONVERSIÓN DE FECHA ---

    const dataToSend: ITipoCambioCreateUpdateRequest= {
      ...formData,
      dFecha: fechaParaAPI // Sobreescribe con el string formateado
    };

    // ... (El resto de la limpieza de datos)

    this.dialogRef.close(dataToSend);
}

	get fc() { return this.tipocambioForm.controls; }

}
