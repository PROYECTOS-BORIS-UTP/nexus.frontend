export interface IRequerimientoServicioDetalleListadoResponse {
    iIdRequerimientoServicioDetalle: number;
    iIdRequerimientoServicio: number;
    iIdServicio: number;
    vServicioNombre: string;
    vDescripcionDetallada: string | null;
    dCantidad: number;
    dPrecioEstimado: number | null;
    vObservacion: string | null;
}