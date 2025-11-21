export interface IProductoResponse {
    iIdProducto: number;
    vCodigo: string;
    vTitulo: string;
    iIdFamilia: number;
    vFamiliaNombre: string;
    iIdUnidadMedida: number;
    nStockMinimo: number;
    vCuentaContable: string;
    vRutaImagen: string;
    nStockActual: number;
    bActivo: boolean;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    iUsuarioModifica: number;
    dFechaModifica: Date;
}