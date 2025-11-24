export interface IRequerimientoServicioListadoResponse {
    iIdRequerimientoServicio: number;
    iIdCompania: number;
    vCompaniaNombre: string;
    vSerie: string;
    vNumero: string;
    dFechaSolicitud: Date | string;
    iIdUsuarioSolicitante: number;
    vUsuarioSolicitanteNombre: string;
    iIdCentroCosto: number;
    vCentroCostoNombre: string;
    iIdEstado: number;
    vEstadoNombre: string;
    vJustificacion: string | null;
}