export interface IServicioListadoRequest {
    iIdServicio?: number;
    vTitulo?: string;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}