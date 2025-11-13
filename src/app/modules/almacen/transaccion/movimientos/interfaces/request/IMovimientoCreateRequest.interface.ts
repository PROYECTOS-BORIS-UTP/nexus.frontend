export interface IMovimientoCreateRequest {
    iIdAlmacen: number;
    iIdProducto: number;
    iIdTipoMovimiento: number;
    dCantidad: number;
    dPrecioUnitario?: number | null;
    iIdDocumentoOrigen?: number | null;
    iIdTipoDocumentoOrigen?: number | null;
    vObservacion?: string | null;
}