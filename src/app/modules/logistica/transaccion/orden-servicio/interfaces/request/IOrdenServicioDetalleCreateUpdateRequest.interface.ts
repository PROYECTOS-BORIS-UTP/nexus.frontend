export interface IOrdenServicioDetalleCreateUpdateRequest {
    iIdOrdenServicioDetalle?: number;
    iIdOrdenServicio: number;
    iIdServicio: number;
    vDescripcionEspecifica?: string;
    dCantidad: number;
    dPrecioUnitario: number;
    iIdRequerimientoServicioDetalle?: number;
}