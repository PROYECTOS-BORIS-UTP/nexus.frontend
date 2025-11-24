export interface IProductoListadoRequest {
    iIdProducto?: number;
    vCodigo?: string;
    vTitulo?: string;
    iIdFamilia?: number;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}