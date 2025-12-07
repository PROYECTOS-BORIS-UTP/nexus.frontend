export interface ICotizacionDetalleCreateUpdateRequest {
    iIdCotizacionDetalle?: number;
    iIdCotizacion: number;
    iIdServicio: number;
    vDescripcion?: string;
    dCantidad: number;
    dPrecioUnitario: number;
    iIdUnidadMedida: number;
}