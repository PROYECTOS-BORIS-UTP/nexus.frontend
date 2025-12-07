export interface IClienteResponse {
    iIdCliente: number;
    iIdCompania: number;
    iIdTipoDocumento: number;
    vTipoDocumentoNombre: string;
    vNumeroDocumento: string;
    vRazonSocial: string;
    vNombreComercial: string;
    vDireccionFiscal: string;
    vTelefono: string;
    vCorreoFacturacion: string;
    iIdVendedor: number;
    vVendedorNombre: string;
    iIdCondicionPago: number;
    vCondicionPagoNombre: string;
    nLineaCredito: number;
    bActivo: boolean;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    iTotalRecords?: number;
}