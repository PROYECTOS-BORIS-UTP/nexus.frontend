import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IPaisListadoRequest extends IPaginationRequest {
    iIdPais?: number | null;
    sTerminoBusqueda?: string | null;
    bActivo?: boolean | null;
}