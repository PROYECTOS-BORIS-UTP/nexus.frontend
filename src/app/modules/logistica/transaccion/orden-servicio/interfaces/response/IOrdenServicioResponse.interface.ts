export interface IOrdenServicioResponse {
    iIdOrdenServicio: number;
    iIdCompania: number;
    iIdProveedor: number;
    vNumeroOrden: string;
    dFechaEmision: Date;
    dFechaInicio: Date;
    dFechaFin: Date;
    iIdMoneda: number;
    nTipoCambio: number;
    iIdFormaPago: number;
    nSubTotal: number;
    nIGV: number;
    nTotal: number;
    vObservacion: string;
    iIdEstado: number;
    bActivo: boolean;
    vProveedorNombre: string;
    vProveedorRUC: string;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    TotalRecords: number;
}