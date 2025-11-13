export interface IRequerimientoCompraListadoResponse {
    iIdRequerimientoCompra: number;
    iIdCompania: number;
    vCompaniaNombre: string;
    vSerie: string;
    vNumero: string;
    dFechaSolicitud: Date | string;
    dFechaNecesidad: Date | string | null;
    iIdUsuarioSolicitante: number;
    vUsuarioSolicitanteNombre: string;
    iIdCentroCosto: number;
    vCentroCostoNombre: string;
    iIdEstado: number;
    vEstadoNombre: string;
    vJustificacion: string | null;
}