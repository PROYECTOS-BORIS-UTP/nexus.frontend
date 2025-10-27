import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IMonedaListadoRequest extends IPaginationRequest {
    iIdMoneda?: number | null;
    sTerminoBusqueda?: string | null;
    bActivo?: boolean | null;
}