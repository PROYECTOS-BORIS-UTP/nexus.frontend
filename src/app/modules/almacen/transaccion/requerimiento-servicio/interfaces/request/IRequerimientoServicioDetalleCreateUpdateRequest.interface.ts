export interface IRequerimientoServicioDetalleCreateUpdateRequest {
    iIdRequerimientoServicioDetalle?: number;
    iIdRequerimientoServicio: number;
    iIdServicio: number;
    vDescripcionDetallada?: string | null;
    dCantidad: number;
    dPrecioEstimado?: number | null;
    vObservacion?: string | null;
}