export interface IRequerimientoCompraDetalleListadoResponse {
    iIdRequerimientoCompraDetalle: number;
    iIdRequerimientoCompra: number;
    iIdProducto: number;
    vProductoCodigo: string;
    vProductoNombre: string;
    iIdUnidadMedida: number;
    vUnidadMedidaAbreviatura: string;
    dCantidadSolicitada: number;
    dCantidadAtendida: number;
    vObservacion: string | null;
}