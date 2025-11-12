export interface IRequerimientoCompraCreateUpdateRequest {
    iIdRequerimientoCompra: number; // 0 para crear
    iIdCompania: number;
    dFechaSolicitud: string; // Formato YYYY-MM-DD
    dFechaNecesidad: string | null; // Formato YYYY-MM-DD
    iIdCentroCosto: number;
    vJustificacion: string | null;
    // iIdUsuarioSolicitante y iIdEstado se manejan en el backend
}