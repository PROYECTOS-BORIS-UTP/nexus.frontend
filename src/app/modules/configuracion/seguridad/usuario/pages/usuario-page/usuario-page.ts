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
import { PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { TableAction, TableGeneric } from '../../../../../../common/components/table-generic/table-generic';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Confirmacion } from '../../../../../../common/components/dialogs/confirmacion/confirmacion';
import { UsuarioForm } from './dialogs/usuario-form/usuario-form';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, tap } from 'rxjs';
import { IUsuarioResponse } from '../../interfaces/response/IUsuarioResponse.interface';
import { UsuarioService } from '../../services/usuario.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { IUsuarioListadoRequest } from '../../interfaces/request/IUsuarioListadoRequest.interface';
import { EstadoGeneral } from "../../../../../../common/components/estado-general/estado-general/estado-general";

@Component({
    selector: 'app-usuario-page',
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
    EstadoGeneral
],
    templateUrl: './usuario-page.html',
    styleUrl: './usuario-page.scss'
})
export class UsuarioPage implements OnInit, OnDestroy {

    // #region Inyección de Dependencias
    private usuarioService = inject(UsuarioService);
    public dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);
    // #endregion

    // #region Estado del Componente (Signals y Variables)
    isLoading = signal(false);
    data = signal<IUsuarioResponse[]>([]);
    totalRecords = signal(0);
    pageSizeOptions = [5, 10, 15, 25];
    currentPageSize = this.pageSizeOptions[0];
    currentPageIndex = 0;
    // #endregion

    // #region Referencias a Componentes Hijos
    @ViewChild(TableGeneric) tableGeneric!: TableGeneric<IUsuarioResponse>; // Referencia a la tabla genérica
    // #endregion

    // #region Configuración de la Tabla
    aDisplayedColumns: string[] = ['select', 'vUsuario', 'bActivo', 'iIdTipoUsuario', 'iIdPersona', 'iIdTipoPersona'];
    selection = new SelectionModel<IUsuarioResponse>(true, []);
    userActions: TableAction[] = [
        { name: 'edit', label: 'Editar Usuario', icon: 'edit' },
        { name: 'delete', label: 'Eliminar Usuario', icon: 'delete' },
    ];
    // #endregion

    // #region Filtrado (RxJS)
    private filterSubject = new Subject<string>();
    private filterSubscription: Subscription | null = null;
    currentFilterValue = '';
    // #endregion

    // #region Ciclo de Vida del Componente
    ngOnInit(): void {
        this.cargarUsuarios(); // Carga inicial de datos al iniciar el componente
        this.setupFilterSubscription(); // Configura la suscripción al filtro
    }

    ngOnDestroy(): void {
        this.filterSubscription?.unsubscribe(); // Limpia la suscripción al destruir
    }
    // #endregion



    // #region Carga de Datos
    /*
     * Obtiene los usuarios del servicio basándose en la paginación y filtro actuales.
     */
    cargarUsuarios(): void {
        this.isLoading.set(true);
        this.selection.clear(); // Limpia selección previa

        const request: IUsuarioListadoRequest = {
            iPageNumber: this.currentPageIndex + 1, // API espera base 1
            iPageSize: this.currentPageSize,
            sTerminoBusqueda: this.currentFilterValue || undefined,
        };

        this.usuarioService.listarUsuarios(request).pipe(
            tap(response => {
                this.totalRecords.set(response.iTotalRecords);
                this.data.set(response.aRecords);
            }),
            catchError(error => {
                console.error('Error al cargar usuarios:', error);
                this.snackBar.open(error.message || 'Error al cargar la lista de usuarios.', 'Cerrar', {
                    duration: 5000,
                    panelClass: ['snackbar-error'] // Clase CSS para estilizar el error
                 });
                this.data.set([]); // Limpia datos en caso de error
                this.totalRecords.set(0);
                return of(null); // Continúa el flujo observable sin error fatal
            }),
            finalize(() => this.isLoading.set(false)) // Asegura que el loading se desactive
        ).subscribe(); // La suscripción activa la petición HTTP
    }
    // #endregion

    // #region Manejo de Paginación
    /*
     * Maneja los eventos emitidos por el paginador del componente TableGeneric.
     * @param event El evento de paginación de Material.
     */
    handlePageEvent(event: PageEvent): void {
        this.currentPageIndex = event.pageIndex;
        this.currentPageSize = event.pageSize;
        this.cargarUsuarios(); // Recarga los datos con la nueva configuración
    }
    // #endregion

    // #region Manejo de Filtro
    /*
     * Configura la suscripción al Subject del filtro con debounce.
     */
    private setupFilterSubscription(): void {
         this.filterSubscription = this.filterSubject.pipe(
            debounceTime(400), // Espera 400ms después de la última pulsación
            distinctUntilChanged() // Solo emite si el valor realmente cambió
        ).subscribe(filterValue => {
            this.currentFilterValue = filterValue;
            this.tableGeneric?.resetPaginator(); // Resetea el paginador de la tabla genérica
            this.currentPageIndex = 0; // Resetea el índice de página local
            this.cargarUsuarios(); // Vuelve a cargar los datos con el filtro aplicado
        });
    }

    /*
     * Se llama en el evento (input) del campo de búsqueda.
     * Envía el valor al filterSubject.
     * @param event El evento del input.
     */
    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.filterSubject.next(filterValue.trim().toLowerCase()); // Emite el valor limpio
    }
    // #endregion

    // #region Lógica de Selección de Filas
    /*
     * Verifica si todas las filas mostradas actualmente están seleccionadas.
     * @returns True si todas las filas están seleccionadas, false en caso contrario.
     */
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.data().length; // Obtiene el número de filas de los datos actuales (signal)
        return numSelected === numRows && numRows > 0; // Asegura que haya filas para seleccionar
    }

    /*
     * Selecciona o deselecciona todas las filas mostradas actualmente.
     */
    toggleAllRows(): void {
        if (this.isAllSelected()) {
            this.selection.clear(); // Deselecciona todo
            return;
        }
        this.selection.select(...this.data()); // Selecciona todas las filas de los datos actuales
    }
    // #endregion

    // #region Manejo de Acciones de Fila
    /*
     * Se llama cuando se hace clic en una acción del menú de una fila.
     * @param event Objeto con la acción ('edit', 'delete') y el elemento de datos (usuario).
     */
    onActionClicked(event: { action: string, element: IUsuarioResponse }): void {
        switch (event.action) {
            case 'edit':
                this.onEditUser(event.element);
                break;
            case 'delete':
                this.onDeleteUser(event.element);
                break;
            default:
                console.warn(`Acción desconocida: ${event.action}`);
        }
    }
    // #endregion

    // #region Apertura de Diálogos (Formulario y Confirmación)
    /*
     * Abre el diálogo para agregar un nuevo usuario.
     */
    onAddUser(): void {
        const dialogRef = this.dialog.open(UsuarioForm, {
            width: '500px',
            disableClose: true, // Impide cerrar haciendo clic fuera
            data: {} // Sin datos iniciales para un nuevo usuario
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) { // Si el diálogo se cerró guardando (no cancelando)
                console.log('Datos del nuevo usuario a crear:', result);
                // --- LLAMADA AL SERVICIO PARA CREAR ---
                // this.usuarioService.crearActualizarUsuario(result).subscribe({
                //     next: (response) => {
                //         this.snackBar.open('Usuario creado exitosamente.', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
                //         this.cargarUsuarios(); // Recarga la tabla
                //     },
                //     error: (error) => {
                //         console.error("Error al crear usuario:", error);
                //         this.snackBar.open(error.message || 'Error al crear el usuario.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
                //     }
                // });
                // Ejemplo simulado:
                this.snackBar.open('Usuario creado exitosamente (simulado).', 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
                this.cargarUsuarios();
            }
        });
    }

    /*
     * Abre el diálogo para editar un usuario existente.
     * @param usuario Los datos del usuario a editar.
     */
    onEditUser(usuario: IUsuarioResponse): void {
        const dialogRef = this.dialog.open(UsuarioForm, {
            width: '500px',
            disableClose: true,
            data: { usuario: usuario } // Pasa los datos del usuario al diálogo
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('Datos del usuario a actualizar:', result);
                // --- LLAMADA AL SERVICIO PARA ACTUALIZAR ---
                // this.usuarioService.crearActualizarUsuario(result).subscribe({
                //     next: (response) => {
                //         this.snackBar.open(`Usuario "${usuario.vUsuario}" actualizado.`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
                //         this.cargarUsuarios(); // Recarga la tabla
                //     },
                //     error: (error) => {
                //         console.error("Error al actualizar usuario:", error);
                //         this.snackBar.open(error.message || 'Error al actualizar el usuario.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
                //     }
                // });
                 // Ejemplo simulado:
                this.snackBar.open(`Usuario "${usuario.vUsuario}" actualizado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-success'] });
                this.cargarUsuarios();
            }
        });
    }

    /*
     * Abre el diálogo de confirmación para eliminar (baja lógica) un usuario.
     * @param usuario El usuario a eliminar.
     */
    onDeleteUser(usuario: IUsuarioResponse): void {
        const dialogRef = this.dialog.open(Confirmacion, {
            width: '400px',
            data: {
                titulo: 'Confirmar Eliminación',
                mensaje: `¿Estás seguro de eliminar al usuario "${usuario.vUsuario}"?`,
                mostrarCampoObservacion: false // Cambia a true si tu API de baja lógica requiere observación
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.confirmado) {
                console.log('Eliminando usuario:', usuario.iIdUsuario, 'Observación:', result.observacion);
                // --- LLAMADA AL SERVICIO PARA ELIMINAR (BAJA LÓGICA) ---
                // const deleteRequest = { iIdUsuario: usuario.iIdUsuario }; // Ajusta según tu DTO de eliminación
                // this.usuarioService.eliminarUsuario(deleteRequest, result.observacion).subscribe({
                //     next: (response) => {
                //         this.snackBar.open(`Usuario "${usuario.vUsuario}" eliminado.`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
                //         this.cargarUsuarios(); // Recarga la tabla
                //     },
                //     error: (error) => {
                //         console.error("Error al eliminar usuario:", error);
                //         this.snackBar.open(error.message || 'Error al eliminar el usuario.', 'Cerrar', { duration: 5000, panelClass: ['snackbar-error'] });
                //     }
                // });
                // Ejemplo simulado:
                this.snackBar.open(`Usuario "${usuario.vUsuario}" eliminado (simulado).`, 'Cerrar', { duration: 3000, panelClass: ['snackbar-warn'] });
                this.cargarUsuarios();
            }
        });
    }
    // #endregion
}