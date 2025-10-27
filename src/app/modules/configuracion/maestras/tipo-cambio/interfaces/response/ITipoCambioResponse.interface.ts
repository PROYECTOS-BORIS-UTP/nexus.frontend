export interface ITipoCambioResponse {
    iIdMonedaOrigen: number;
    vMonedaOrigenDesc: string;
    vMonedaOrigenSimbolo: string;
    iIdMonedaDestino: number;
    vMonedaDestinoDesc: string;
    vMonedaDestinoSimbolo: string;
    dFecha: Date | string;
    dCompra: number;
    dVenta: number;
    iUsuarioCrea: number;
    dFechaCrea: Date | string;
    iUsuarioModifica: number | null;
    dFechaModifica: Date | string | null;
}