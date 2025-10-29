import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TableAction, TableGeneric } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { IPersonaResponse } from '../../interfaces/response/IPersonaResponse.interface';
import { PersonaService } from '../../services/persona.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IPersonaListadoRequest } from '../../interfaces/request/IPersonaListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';
import { PersonaForm } from './dialogs/persona-form/persona-form';
import { IPersonaCreateUpdateRequest } from '../../interfaces/request/IPersonaCreateUpdateRequest.interface';

@Component({
    selector: 'app-persona-page',
    imports: [
        CommonModule,
        MatTableModule,
        MatProgressBarModule,
        MatChipsModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        TableGeneric,
        MatDialogModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatPaginatorModule,
        EstadoGeneral
    ],
    templateUrl: './persona-page.html',
    styleUrl: './persona-page.scss'
})
export class PersonaPage implements OnInit, OnDestroy {

    // #region Inyección de Dependencias
    private personaService = inject(PersonaService);
    public dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    // #endregion

    // #region Estado del Componente (Signals y Variables)
    isLoading = signal(false);
    data = signal<IPersonaResponse[]>([]);
    totalRecords = signal(0);
    pageSizeOptions = [10, 25, 50, 100]; // Ajusta según necesites
    currentPageSize = this.pageSizeOptions[0];
    currentPageIndex = 0;
    // #endregion

    // #region Referencias a Componentes Hijos
    @ViewChild(TableGeneric) tableGeneric!: TableGeneric<IPersonaResponse>;
    // #endregion

    // #region Configuración de la Tabla
    // Define las columnas a mostrar según IPersonaResponse
    aDisplayedColumns: string[] = ['select', 'vNombreCompleto', 'vDNI', 'vRUC', 'vCorreo', 'vCelular1', 'bActivo']; // Ajusta las columnas que quieras ver
    selection = new SelectionModel<IPersonaResponse>(true, []);
    personaActions: TableAction[] = [ // Acciones específicas
        { name: 'edit', label: 'Editar Persona', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Persona', icon: 'delete' },
    ];
    // #endregion

    // #region Filtrado (RxJS)
    private filterSubject = new Subject<string>();
    private filterSubscription: Subscription | null = null;
    currentFilterValue = '';
    // #endregion

    // #region Ciclo de Vida del Componente
    ngOnInit(): void {
        this.cargarPersonas();
        this.setupFilterSubscription();
    }

    ngOnDestroy(): void {
        this.filterSubscription?.unsubscribe();
    }
    // #endregion

    // #region Carga de Datos
    /*
     * Obtiene las personas del servicio.
     */
    cargarPersonas(): void {
        this.isLoading.set(true);
        this.selection.clear();

        const request: IPersonaListadoRequest = {
            iPageNumber: this.currentPageIndex + 1,
            iPageSize: this.currentPageSize,
            // Usaremos sTerminoBusqueda para filtrar por nombre completo
            sTerminoBusqueda: this.currentFilterValue || undefined,
            // Puedes añadir lógica para usar vDNIFiltro o vRUCFiltro si creas inputs separados
            // vDNIFiltro: ...,
            // vRUCFiltro: ...,
        };

        this.personaService.listarPersonas(request).pipe(
            tap(response => {
                this.totalRecords.set(response.iTotalRecords);
                this.data.set(response.aRecords);
            }),
            catchError(error => {
                console.error('Error al cargar personas:', error);
                this.snackBar.open(error.message || 'Error al cargar la lista de personas.', 'Cerrar', {
                    duration: 5000, panelClass: ['snackbar-error']
                });
                this.data.set([]);
                this.totalRecords.set(0);
                return of(null);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe();
    }
    // #endregion

    // #region Manejo de Paginación
    /*
     * Maneja los eventos del paginador.
     */
    handlePageEvent(event: PageEvent): void {
        this.currentPageIndex = event.pageIndex;
        this.currentPageSize = event.pageSize;
        this.cargarPersonas();
    }
    // #endregion

    // #region Manejo de Filtro
    /*
     * Configura la suscripción al filtro.
     */
    private setupFilterSubscription(): void {
        this.filterSubscription = this.filterSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(filterValue => {
            this.currentFilterValue = filterValue;
            this.tableGeneric?.resetPaginator();
            this.currentPageIndex = 0;
            this.cargarPersonas();
        });
    }

    /*
     * Aplica el filtro desde el input.
     */
    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        // Envía el término de búsqueda al Subject
        this.filterSubject.next(filterValue.trim()); // No es necesario toLowerCase si el backend no es sensible
    }
    // #endregion

    // #region Lógica de Selección de Filas
    /*
     * Verifica si todo está seleccionado.
     */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.data().length;
        return numSelected === numRows && numRows > 0;
    }

    /*
     * Selecciona/Deselecciona todas las filas.
     */
    toggleAllRows(): void {
        this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
    }

    checkboxLabel(row?: IPersonaResponse): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.iIdPersona + 1}`;
    }
    // #endregion

    // #region Manejo de Acciones de Fila
    /*
     * Maneja clics en las acciones de fila.
     */
    onActionClicked(event: { action: string, element: IPersonaResponse }): void {
        switch (event.action) {
            case 'edit':
                this.onEditPersona(event.element);
                break;
            case 'delete':
                this.onDeletePersona(event.element);
                break;
            default:
                console.warn(`Acción desconocida: ${event.action}`);
        }
    }
    // #endregion

    // #region Apertura de Diálogos
    /*
     * Abre diálogo para agregar persona.
     */
    onAddPersona(): void {
        // --- DESCOMENTA CUANDO CREES EL FORMULARIO ---
        const dialogRef = this.dialog.open(PersonaForm, {
            width: '100%', // Ajusta el ancho según tu formulario
            maxWidth: '900px',
            disableClose: true, // Evita cerrar haciendo clic fuera
            data: { persona: null } // Pasa null para indicar creación
        });

        dialogRef.afterClosed().subscribe((result: IPersonaCreateUpdateRequest | undefined) => {
            if (result) {
                console.log('Datos para crear persona:', result);
                this.isLoading.set(true);
                this.personaService.crearActualizarPersona(result).pipe(
                    tap(response => {
                        this.showSnackbar(response.vMensaje || 'Persona creada exitosamente.', 'snackbar-success');
                        this.cargarPersonas(); // Recargar la lista
                    }),
                    catchError(error => {
                        console.error('Error al crear persona:', error);
                        this.showSnackbar(error.message || 'Error al crear la persona.', 'snackbar-error');
                        return of(null);
                    }),
                    finalize(() => this.isLoading.set(false))
                ).subscribe();
            }
        });
    }

    /*
     * Abre diálogo para editar persona.
     */
    onEditPersona(persona: IPersonaResponse): void {
        const personaParaEditar: IPersonaCreateUpdateRequest = {
            // Mapea los campos de IPersonaResponse a IPersonaCreateUpdateRequest
            // Asegúrate de incluir TODOS los campos necesarios por el DTO del backend
            iIdPersona: persona.iIdPersona,
            iIdTipoPersona: persona.iIdTipoPersona, // Necesitarás este dato en IPersonaResponse
            vPrimerNombre: persona.vPrimerNombre, // Necesitarás este dato en IPersonaResponse
            vSegundoNombre: persona.vSegundoNombre, // Necesitarás este dato en IPersonaResponse
            vApellidoPaterno: persona.vApellidoPaterno, // Necesitarás este dato en IPersonaResponse
            vApellidoMaterno: persona.vApellidoMaterno, // Necesitarás este dato en IPersonaResponse
            dFechaNacimiento: persona.dFechaNacimiento ? new Date(persona.dFechaNacimiento).toISOString().split('T')[0] : null, // Formato YYYY-MM-DD si viene como Date
            iIdUbigeoNacimiento: persona.iIdUbigeoNacimiento, // Necesitarás este dato en IPersonaResponse
            iIdGenero: persona.iIdGenero, // Necesitarás este dato en IPersonaResponse
            iIdEstadoCivil: persona.iIdEstadoCivil, // Necesitarás este dato en IPersonaResponse
            vCorreo: persona.vCorreo,
            vCelular1: persona.vCelular1,
            vCelular2: persona.vCelular2, // Necesitarás este dato en IPersonaResponse
            vTelefono: persona.vTelefono, // Necesitarás este dato en IPersonaResponse
            vDNI: persona.vDNI,
            vCE: persona.vCE, // Necesitarás este dato en IPersonaResponse
            vRUC: persona.vRUC,
            bActivo: persona.bActivo,
        };


        const dialogRef = this.dialog.open(PersonaForm, {
            width: '700px',
            disableClose: true,
            data: { persona: personaParaEditar } // Pasa el objeto mapeado
        });

        dialogRef.afterClosed().subscribe((result: IPersonaCreateUpdateRequest | undefined) => {
            if (result) {
                console.log('Datos para actualizar persona:', result);
                this.isLoading.set(true);
                // Asegúrate que el result SÍ tenga el iIdPersona
                this.personaService.crearActualizarPersona(result).pipe(
                    tap(response => {
                        this.showSnackbar(response.vMensaje || `Persona "${persona.vNombreCompleto}" actualizada.`, 'snackbar-success');
                        this.cargarPersonas(); // Recargar la lista
                    }),
                    catchError(error => {
                        console.error('Error al actualizar persona:', error);
                        this.showSnackbar(error.message || 'Error al actualizar la persona.', 'snackbar-error');
                        return of(null);
                    }),
                    finalize(() => this.isLoading.set(false))
                ).subscribe();
            }
        });
    }

    /*
     * Abre diálogo de confirmación para eliminar persona.
     */
    onDeletePersona(persona: IPersonaResponse): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de eliminar (dar de baja lógica) a "${persona.vNombreCompleto}"?`,
                mostrarCampoObservacion: false // Cambia a true si necesitas enviar observación
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Eliminando persona:', persona.iIdPersona);
                this.isLoading.set(true);
                this.personaService.eliminarPersona(persona.iIdPersona).pipe(
                    tap(response => {
                        this.showSnackbar(response.vMensaje || `Persona "${persona.vNombreCompleto}" eliminada.`, 'snackbar-warn');
                        this.cargarPersonas(); // Recargar la lista
                    }),
                    catchError(error => {
                        console.error('Error al eliminar persona:', error);
                        this.showSnackbar(error.message || 'Error al eliminar la persona.', 'snackbar-error');
                        return of(null);
                    }),
                    finalize(() => this.isLoading.set(false))
                ).subscribe();
            }
        });
    }
    // #endregion


    // #region Utilidades (Snackbar)
    private showSnackbar(message: string, panelClass: string = 'snackbar-info'): void {
        this.snackBar.open(message, 'Cerrar', {
            duration: 5000,
            panelClass: [panelClass] // Puede ser 'snackbar-success', 'snackbar-warn', 'snackbar-error'
        });
    }
    // #endregion
}