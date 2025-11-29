export interface IOrdenCompraDetalleCreateUpdateRequest {
    iIdOrdenCompraDetalle?: number;
    iIdOrdenCompra: number;
    iIdProducto: number;
    iIdUnidadMedida: number;
    dCantidad: number;
    dPrecioUnitario: number;
    iIdRequerimientoCompraDetalle?: number;
}