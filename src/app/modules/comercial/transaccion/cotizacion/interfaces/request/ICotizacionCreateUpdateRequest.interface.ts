export interface ICotizacionCreateUpdateRequest {
    iIdCotizacion?: number;
    iIdCompania: number;
    iIdCliente: number;
    iIdClienteContacto?: number;
    vNumeroCotizacion?: string;
    dFechaEmision: string;
    dFechaVencimiento: string;
    iIdMoneda: number;
    nTipoCambio: number;
    nSubTotal: number;
    nIGV: number;
    nTotal: number;
    vObservacion?: string;
    vCondicionesComerciales?: string;
    iIdEstado: number;
    bActivo: boolean;
}