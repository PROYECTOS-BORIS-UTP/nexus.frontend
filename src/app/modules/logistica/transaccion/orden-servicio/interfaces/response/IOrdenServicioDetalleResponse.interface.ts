export interface IOrdenServicioDetalleResponse {
    iIdOrdenServicioDetalle: number;
    iIdOrdenServicio: number;
    iIdServicio: number;
    vServicioNombre: string;
    vDescripcionEspecifica: string;
    dCantidad: number;
    dPrecioUnitario: number;
    dTotalLinea: number;
    iIdRequerimientoServicioDetalle: number;
}