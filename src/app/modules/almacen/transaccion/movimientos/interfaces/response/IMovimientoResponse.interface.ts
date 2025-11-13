export interface IMovimientoResponse {
    iIdMovimiento: number;
    iIdAlmacen: number;
    vAlmacenNombre: string;
    iIdProducto: number;
    vProductoNombre: string;
    iIdTipoMovimiento: number;
    vTipoMovimientoNombre: string | null;
    dFechaMovimiento: Date | string;
    dCantidad: number;
    dPrecioUnitario: number | null;
    dTotal: number | null;
    iIdDocumentoOrigen: number | null;
    iIdTipoDocumentoOrigen: number | null;
    vTipoDocumentoOrigenNombre: string | null;
    vObservacion: string | null;
    bActivo: boolean;
}