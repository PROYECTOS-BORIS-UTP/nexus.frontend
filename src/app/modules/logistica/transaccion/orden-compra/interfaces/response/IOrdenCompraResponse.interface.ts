export interface IOrdenCompraResponse {
    iIdOrdenCompra: number;
    iIdCompania: number;
    iIdProveedor: number;
    vNumeroOrden: string;
    dFechaEmision: Date;
    dFechaEntrega: Date;
    iIdMoneda: number;
    nTipoCambio: number;
    iIdFormaPago: number;
    nSubTotal: number;
    nIGV: number;
    nTotal: number;
    vObservacion: string;
    vLugarEntrega: string;
    iIdEstado: number;
    bActivo: boolean;
    vProveedorNombre: string;
    vProveedorRUC: string;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    TotalRecords: number;
}