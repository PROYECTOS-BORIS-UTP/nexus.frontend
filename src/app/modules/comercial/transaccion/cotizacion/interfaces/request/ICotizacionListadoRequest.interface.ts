export interface ICotizacionListadoRequest {
    iPageNumber: number;
    iPageSize: number;
    iIdCotizacion?: number;
    iIdCompania?: number;
    vNumeroCotizacion?: string;
    iIdCliente?: number;
    dFechaInicio?: string;
    dFechaFin?: string;
    iIdEstado?: number;
    bActivo?: boolean;
}