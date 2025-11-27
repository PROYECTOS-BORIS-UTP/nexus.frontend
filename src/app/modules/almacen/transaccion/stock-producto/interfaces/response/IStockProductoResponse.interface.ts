export interface IStockProductoResponse {
    iIdAlmacen: number;
    vAlmacenNombre: string;
    iIdProducto: number;
    vProductoNombre: string;
    vProductoCodigo: string;
    dStockActual: number;
    dStockComprometido: number;
    dStockDisponible: number;
    dFechaUltimoMovimiento: Date;
    iTotalRecords?: number;
}