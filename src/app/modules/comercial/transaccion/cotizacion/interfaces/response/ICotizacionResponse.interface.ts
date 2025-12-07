export interface ICotizacionResponse {
    iIdCotizacion: number;
    iIdCompania: number;
    vNumeroCotizacion: string;
    dFechaEmision: string; // Date or string depending on parsing
    dFechaVencimiento: string;
    iIdCliente: number;
    vClienteNombre: string;
    vClienteDocumento: string;
    iIdMoneda: number;
    nTotal: number;
    iIdEstado: number;
    bActivo: boolean;
    iUsuarioCrea: number;
    dFechaCrea: string;
    iTotalRecords: number;
}