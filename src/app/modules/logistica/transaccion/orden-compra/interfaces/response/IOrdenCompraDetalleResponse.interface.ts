export interface IOrdenCompraDetalleResponse {
    iIdOrdenCompraDetalle: number;
    iIdOrdenCompra: number;
    iIdProducto: number;
    vProductoCodigo: string;
    vProductoNombre: string;
    iIdUnidadMedida: number;
    vUnidadMedida: string;
    dCantidad: number;
    dPrecioUnitario: number;
    dTotalLinea: number;
    iIdRequerimientoCompraDetalle: number;
}