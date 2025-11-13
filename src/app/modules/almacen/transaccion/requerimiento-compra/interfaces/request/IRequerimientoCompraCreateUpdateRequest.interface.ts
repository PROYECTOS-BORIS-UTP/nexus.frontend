export interface IRequerimientoCompraCreateUpdateRequest {
    iIdRequerimientoCompra: number; // 0 para crear
    iIdCompania: number;
    vSerie: string;
    vNumero: string;
    dFechaSolicitud: string; // Formato YYYY-MM-DD
    dFechaNecesidad: string | null; // Formato YYYY-MM-DD
    iIdUsuarioSolicitante: number; // Formato YYYY-MM-DD
    iIdCentroCosto: number;
    iIdEstado: number;
    vJustificacion: string | null;
}