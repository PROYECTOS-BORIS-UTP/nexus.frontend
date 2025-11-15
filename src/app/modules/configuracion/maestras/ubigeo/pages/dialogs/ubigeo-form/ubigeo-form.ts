import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IUbigeoCreateUpdateRequest } from '../../../interfaces/request/IUbigeoCreateUpdateRequest.interface'; 

// Nuevas interfaces para los catálogos (ajustar según tu API real)
export interface TipoUbigeo { iIdTipoUbigeo: number; vDescripcion: string; }
export interface Pais { iIdPais: number; vNombre: string; }

// Interfaz para los datos que recibe el diálogo
export interface UbigeoFormData {
	UbigeoExistente?: IUbigeoCreateUpdateRequest | null; 
}

@Component({
	selector: 'app-ubigeo-form',
	imports: [
		CommonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule, // Necesario para los selects
		MatDialogModule,
		MatCheckboxModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatProgressSpinnerModule
	],
	templateUrl: './ubigeo-form.html',
	styleUrls: ['./ubigeo-form.scss']
})
export class UbigeoForm implements OnInit {

	private fb = inject(FormBuilder);
	public dialogRef = inject(MatDialogRef<UbigeoForm>);

	// --- Propiedades para Catálogos ---
    // En un proyecto real, estas listas se cargarían desde un servicio.
    public tiposUbigeo: TipoUbigeo[] = [];
    public paises: Pais[] = [];
    public isLoadingLists = true;
    // ----------------------------------

	ubigeoForm: FormGroup;
	tituloDialogo = 'Agregar Ubigeo';
	public ubigeoExistente: IUbigeoCreateUpdateRequest | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: UbigeoFormData
	) {
		this.ubigeoExistente = this.data.UbigeoExistente || null;

		this.ubigeoForm = this.fb.group({
            iIdUbigeo: [this.ubigeoExistente?.iIdUbigeo || 0], 
			vCodigo: ['', [Validators.required, Validators.maxLength(50)]],
			vDescripcion: [null, [Validators.required, Validators.maxLength(250)]],
            
            // Los valores iniciales pueden ser nulos
            iIdTipoUbigeo: [null, [Validators.required]],
            iIdPais: [null, [Validators.required]],

			bActivo: [true, Validators.required]
		});
	}

	ngOnInit(): void {
        // Cargar catálogos primero
        this.loadCatalogs(); 

		if (this.ubigeoExistente) {
			this.tituloDialogo = 'Editar Ubigeo';
			
            // Simplemente parcheamos los valores, ya que provienen del IUbigeoCreateUpdateRequest
			this.ubigeoForm.patchValue(this.ubigeoExistente);
		} else {
			this.tituloDialogo = 'Crear Ubigeo';
		}
	}

    // Lógica para cargar los datos de los selectores
    private loadCatalogs(): void {
        // *** ESTA ES LA SIMULACIÓN DE LA LLAMADA AL SERVICIO ***
        // *** DEBES REEMPLAZAR ESTO POR LA LÓGICA DE TU API ***
        this.isLoadingLists = true;
        setTimeout(() => { // Simula un retraso de API
            this.tiposUbigeo = [
                { iIdTipoUbigeo: 1, vDescripcion: 'DEPARTAMENTO' }, 
                { iIdTipoUbigeo: 2, vDescripcion: 'PROVINCIA' },
                { iIdTipoUbigeo: 3, vDescripcion: 'DISTRITO' }
            ];
            this.paises = [
                { iIdPais: 1, vNombre: 'PERU' }, 
                { iIdPais: 2, vNombre: 'COLOMBIA' }
            ];
            this.isLoadingLists = false;
        }, 100); 
        // *******************************************************
    }
    
	// Getter para acceder fácilmente a los controles del formulario
	get fc() { return this.ubigeoForm.controls; }

	onCancel(): void {
		this.dialogRef.close();
	}
    
    // Función auxiliar para asegurar que el valor sea numérico y no NaN
    private getNumberValue(value: any): number {
        // Si es null, undefined, o string vacío, retorna 0 (ya que son requeridos)
        if (value === null || value === undefined || value === '') {
            return 0; 
        }
        const num = Number(value);
        // Si la conversión falla (NaN), retorna 0 para evitar el 400
        return isNaN(num) ? 0 : num; 
    }

	onSave(): void {
		if (this.ubigeoForm.invalid) { this.ubigeoForm.markAllAsTouched(); return; }

		const formData = this.ubigeoForm.getRawValue();

		const dataToSend: IUbigeoCreateUpdateRequest = {
			vCodigo: formData.vCodigo,
			vDescripcion: formData.vDescripcion,
			
            // Aplicamos la conversión segura, aunque si se usa MatSelect con [value] de tipo number, 
            // esto podría no ser necesario, pero es un buen guardián.
			iIdTipoUbigeo: this.getNumberValue(formData.iIdTipoUbigeo), 
			iIdPais: this.getNumberValue(formData.iIdPais),
			
			bActivo: formData.bActivo,
			iIdUbigeo: this.ubigeoExistente?.iIdUbigeo ?? 0
		};
        
        // El bucle para convertir strings vacíos a null se elimina o se ajusta. 
        // Dado que los campos ID ahora son selectores (números) y son requeridos, 
        // es mejor asegurarse de que el backend siempre reciba un número.

		this.dialogRef.close(dataToSend);
	}
}