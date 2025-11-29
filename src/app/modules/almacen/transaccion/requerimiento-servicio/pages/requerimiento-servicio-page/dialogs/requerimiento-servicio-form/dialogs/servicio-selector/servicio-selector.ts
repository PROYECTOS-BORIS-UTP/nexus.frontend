import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize, tap, catchError, of } from 'rxjs';
import { TableGeneric } from '../../../../../../../../../../common/components/table-generic/table-generic';
import { ServicioService } from '../../../../../../../../../logistica/mantenimiento/servicio/services/servicio.service';
import { IServicioResponse } from '../../../../../../../../../logistica/mantenimiento/servicio/interfaces/response/IServicioResponse.interface';
import { IServicioListadoRequest } from '../../../../../../../../../logistica/mantenimiento/servicio/interfaces/request/IServicioListadoRequest.interface';


@Component({
    selector: 'app-servicio-selector',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatProgressBarModule,
        FormsModule,
        ReactiveFormsModule,
        TableGeneric
    ],
    templateUrl: './servicio-selector.html',
    styleUrl: './servicio-selector.scss'
})
export class ServicioSelector {
    private servicioService = inject(ServicioService);
    public dialogRef = inject(MatDialogRef<ServicioSelector>);

    isLoading = signal(false);
    data = signal<IServicioResponse[]>([]);
    totalRecords = signal(0);

    pageSizeOptions = [5, 10, 20];
    currentPageSize = 5;
    currentPageIndex = 0;

    displayedColumns: string[] = ['select', 'vTitulo', 'vDescripcion'];
    selection = new SelectionModel<IServicioResponse>(true, []);

    private filterSubject = new Subject<string>();
    private filterSubscription: Subscription | null = null;
    currentFilterValue = '';

    @ViewChild(TableGeneric) tableGeneric!: TableGeneric<IServicioResponse>;

    ngOnInit(): void {
        this.cargarServicios();
        this.setupFilterSubscription();
    }

    ngOnDestroy(): void {
        this.filterSubscription?.unsubscribe();
    }

    cargarServicios(): void {
        this.isLoading.set(true);
        const request: IServicioListadoRequest = {
            iPageNumber: this.currentPageIndex + 1,
            iPageSize: this.currentPageSize,
            vTitulo: this.currentFilterValue || undefined,
            bActivo: true
        };

        this.servicioService.listarServicios(request).pipe(
            tap(response => {
                this.totalRecords.set(response.iTotalRecords);
                this.data.set(response.aRecords);
            }),
            catchError(error => {
                console.error('Error cargando servicios:', error);
                this.data.set([]);
                this.totalRecords.set(0);
                return of(null);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe();
    }

    handlePageEvent(event: PageEvent): void {
        this.currentPageIndex = event.pageIndex;
        this.currentPageSize = event.pageSize;
        this.cargarServicios();
    }

    private setupFilterSubscription(): void {
        this.filterSubscription = this.filterSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(filterValue => {
            this.currentFilterValue = filterValue;
            this.currentPageIndex = 0;
            if (this.tableGeneric) {
                this.tableGeneric.resetPaginator();
            }
            this.cargarServicios();
        });
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.filterSubject.next(filterValue.trim());
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.data().length;
        return numSelected === numRows && numRows > 0;
    }

    toggleAllRows(): void {
        this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.data());
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close(this.selection.selected);
    }
}
