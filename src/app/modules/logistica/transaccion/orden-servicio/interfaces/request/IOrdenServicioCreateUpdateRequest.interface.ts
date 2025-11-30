export interface IOrdenServicioCreateUpdateRequest {
    iIdOrdenServicio?: number;
    iIdCompania: number;
    iIdProveedor: number;
    vNumeroOrden: string;
    dFechaEmision: string;
    dFechaInicio?: string;
    dFechaFin?: string;
    iIdMoneda: number;
    nTipoCambio: number;
    iIdFormaPago?: number;
    nSubTotal: number;
    nIGV: number;
    nTotal: number;
    vObservacion?: string;
    iIdEstado: number;
    bActivo: boolean;
}