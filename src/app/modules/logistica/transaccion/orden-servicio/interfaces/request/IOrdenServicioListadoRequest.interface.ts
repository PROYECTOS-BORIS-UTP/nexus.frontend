export interface IOrdenServicioListadoRequest {
    iIdOrdenServicio?: number;
    iIdCompania?: number;
    vNumeroOrden?: string;
    iIdProveedor?: number;
    dFechaInicio?: string;
    dFechaFin?: string;
    iIdEstado?: number;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}