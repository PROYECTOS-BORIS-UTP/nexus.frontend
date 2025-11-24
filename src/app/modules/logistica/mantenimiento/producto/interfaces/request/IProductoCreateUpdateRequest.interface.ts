export interface IProductoCreateUpdateRequest {
    iIdProducto?: number;
    vCodigo: string;
    vTitulo: string;
    iIdFamilia: number;
    iIdUnidadMedida: number;
    nStockMinimo?: number;
    vCuentaContable?: string;
    vRutaImagen?: string;
    bActivo: boolean;
}