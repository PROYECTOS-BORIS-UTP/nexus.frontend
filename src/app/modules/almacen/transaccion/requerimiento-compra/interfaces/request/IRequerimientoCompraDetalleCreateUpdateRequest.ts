export interface IRequerimientoCompraDetalleCreateUpdateRequest {
    iIdRequerimientoCompraDetalle: number; // 0 para nuevos
    iIdRequerimientoCompra: number;        // ID de la cabecera
    iIdProducto: number;
    iIdUnidadMedida: number;
    dCantidadSolicitada: number;
    vObservacion?: string | null;
}