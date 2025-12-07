export interface IClienteCreateUpdateRequest {
    iIdCliente?: number;
    iIdCompania: number;
    iIdTipoDocumento: number;
    vNumeroDocumento: string;
    vRazonSocial: string;
    vNombreComercial?: string;
    vDireccionFiscal?: string;
    vDireccionEntrega?: string;
    vTelefono?: string;
    vCorreoFacturacion?: string;
    iIdVendedor?: number;
    iIdCondicionPago?: number;
    nLineaCredito?: number;
    bActivo: boolean;
}