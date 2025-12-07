export interface ICotizacionDetalleResponse {
    iIdCotizacionDetalle: number;
    iIdCotizacion: number;
    iIdServicio: number;
    vServicioNombre: string;
    vDescripcion: string;
    iIdUnidadMedida: number;
    vUnidadMedida: string;
    dCantidad: number;
    dPrecioUnitario: number;
    dTotalLinea: number;
}