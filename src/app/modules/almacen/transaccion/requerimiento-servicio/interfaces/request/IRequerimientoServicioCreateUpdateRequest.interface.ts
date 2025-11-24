export interface IRequerimientoServicioCreateUpdateRequest {
    iIdRequerimientoServicio?: number;
    iIdCompania: number;
    vSerie: string;
    vNumero: string;
    dFechaSolicitud: string;
    iIdUsuarioSolicitante: number;
    iIdCentroCosto: number;
    iIdEstado: number;
    vJustificacion?: string | null;
}