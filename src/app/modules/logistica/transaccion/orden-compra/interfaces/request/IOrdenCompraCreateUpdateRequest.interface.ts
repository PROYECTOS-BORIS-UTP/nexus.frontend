export interface IOrdenCompraCreateUpdateRequest {
    iIdOrdenCompra?: number;
    iIdCompania: number;
    iIdProveedor: number;
    vNumeroOrden: string;
    dFechaEmision: string;
    dFechaEntrega?: string;
    iIdMoneda: number;
    nTipoCambio: number;
    iIdFormaPago: number;
    nSubTotal: number;
    nIGV: number;
    nTotal: number;
    vObservacion?: string;
    vLugarEntrega?: string;
    iIdEstado: number;
    bActivo: boolean;
}