import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface ITipoCambioListadoRequest extends IPaginationRequest {
    iIdMonedaOrigen?: number | null;
    iIdMonedaDestino?: number | null;
    dFechaInicio?: string | null; // Formato YYYY-MM-DD
    dFechaFin?: string | null;    // Formato YYYY-MM-DD
}