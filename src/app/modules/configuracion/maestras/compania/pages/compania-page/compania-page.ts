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
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator'; // Importa MatPaginatorModule
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TableAction, TableGeneric } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';

import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { ICompaniaResponse } from '../../interfaces/response/ICompaniaResponse.interface';
import { CompaniaService } from '../../services/compania.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ICompaniaListadoRequest } from '../../interfaces/request/ICompaniaListadoRequest.interface';
import { EstadoGeneral } from '../../../../../../common/components/estado-general/estado-general/estado-general';


@Component({
    selector: 'app-compania-page',
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
    templateUrl: './compania-page.html',
    styleUrl: './compania-page.scss'
})
export class CompaniaPage implements OnInit, OnDestroy {

    // #region Inyección de Dependencias
    private companiaService = inject(CompaniaService);
    public dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    // #endregion

    // #region Estado del Componente (Signals y Variables)
    isLoading = signal(false);
    data = signal<ICompaniaResponse[]>([]);
    totalRecords = signal(0);
    pageSizeOptions = [5, 10, 25, 100]; // Ajusta según necesites
    currentPageSize = this.pageSizeOptions[0];
    currentPageIndex = 0;
    // #endregion

    // #region Referencias a Componentes Hijos
    @ViewChild(TableGeneric) tableGeneric!: TableGeneric<ICompaniaResponse>;
    // #endregion

    // #region Configuración de la Tabla
    // Define las columnas a mostrar según ICompaniaResponse
    aDisplayedColumns: string[] = ['select', 'vCodigo', 'vRUC', 'vRazonSocial', 'vAbreviatura', 'vDireccion', 'bActivo'];
    selection = new SelectionModel<ICompaniaResponse>(true, []);
    companiaActions: TableAction[] = [ // Acciones específicas
        { name: 'edit', label: 'Editar Compañía', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Compañía', icon: 'delete' },
    ];
    // #endregion

    // #region Filtrado (RxJS)
    private filterSubject = new Subject<string>();
    private filterSubscription: Subscription | null = null;
    currentFilterValue = '';
    // #endregion

    // #region Ciclo de Vida del Componente
    ngOnInit(): void {
        this.cargarCompanias();
        this.setupFilterSubscription();
    }

    ngOnDestroy(): void {
        this.filterSubscription?.unsubscribe();
    }
    // #endregion

    // #region Carga de Datos
    /*
     * Obtiene las compañías del servicio.
     */
    cargarCompanias(): void {
        this.isLoading.set(true);
        this.selection.clear();

        const request: ICompaniaListadoRequest = {
            iPageNumber: this.currentPageIndex + 1,
            iPageSize: this.currentPageSize,
            // Usaremos vRazonSocial para el filtro general, ajusta si necesitas filtrar por RUC también
            vRazonSocial: this.currentFilterValue || undefined,
            // Puedes añadir otros filtros aquí si es necesario
            // vRUC: ...,
            // bActivo: ...,
        };

        this.companiaService.listarCompanias(request).pipe(
            tap(response => {
                this.totalRecords.set(response.iTotalRecords);
                this.data.set(response.aRecords);
            }),
            catchError(error => {
                console.error('Error al cargar compañías:', error);
                this.snackBar.open(error.message || 'Error al cargar la lista de compañías.', 'Cerrar', {
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
        this.cargarCompanias();
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
            this.cargarCompanias();
        });
    }

    /*
     * Aplica el filtro desde el input.
     */
    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        // Envía el término de búsqueda al Subject
        this.filterSubject.next(filterValue.trim()); // No es necesario toLowerCase aquí si el backend no es sensible
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
    // #endregion

    // #region Manejo de Acciones de Fila
    /*
     * Maneja clics en las acciones de fila.
     */
    onActionClicked(event: { action: string, element: ICompaniaResponse }): void {
        switch (event.action) {
            case 'edit':
                this.onEditCompania(event.element);
                break;
            case 'delete':
                this.onDeleteCompania(event.element);
                break;
            default:
                console.warn(`Acción desconocida: ${event.action}`);
        }
    }
    // #endregion

    // #region Apertura de Diálogos
    /*
     * Abre diálogo para agregar compañía.
     */
    onAddCompania(): void {
        // Debes crear el componente CompaniaForm
        // const dialogRef = this.dialog.open(CompaniaForm, { width: '600px', disableClose: true, data: {} });
        // dialogRef.afterClosed().subscribe(result => {
        //   if (result) {
        //     console.log('Nueva compañía:', result);
        //     // --- LLAMADA AL SERVICIO PARA CREAR ---
        //     // this.companiaService.crearActualizarCompania(result).subscribe(...);
        //     this.snackBar.open('Compañía creada (simulado).', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
        //     this.cargarCompanias();
        //   }
        // });
        alert('Funcionalidad "Agregar Compañía" no implementada.'); // Placeholder
    }

    /*
     * Abre diálogo para editar compañía.
     */
    onEditCompania(compania: ICompaniaResponse): void {
        // const dialogRef = this.dialog.open(CompaniaForm, { width: '600px', disableClose: true, data: { compania: compania } });
        // dialogRef.afterClosed().subscribe(result => {
        //   if (result) {
        //     console.log('Compañía a actualizar:', result);
        //     // --- LLAMADA AL SERVICIO PARA ACTUALIZAR ---
        //     // this.companiaService.crearActualizarCompania(result).subscribe(...);
        //     this.snackBar.open(`Compañía "${compania.vRazonSocial}" actualizada (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
        //     this.cargarCompanias();
        //   }
        // });
        alert(`Funcionalidad "Editar Compañía: ${compania.vRazonSocial}" no implementada.`); // Placeholder
    }

    /*
     * Abre diálogo de confirmación para eliminar compañía.
     */
    onDeleteCompania(compania: ICompaniaResponse): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de eliminar la compañía "${compania.vRazonSocial}"?`,
                mostrarCampoObservacion: false // O true si tu API lo requiere
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Eliminando compañía:', compania.iIdCompania, 'Observación:', result.observacion);
                // --- LLAMADA AL SERVICIO PARA ELIMINAR ---
                // this.companiaService.eliminarCompania(compania.iIdCompania, result.observacion).subscribe(...);
                this.snackBar.open(`Compañía "${compania.vRazonSocial}" eliminada (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
                this.cargarCompanias();
            }
        });
    }
    // #endregion
}