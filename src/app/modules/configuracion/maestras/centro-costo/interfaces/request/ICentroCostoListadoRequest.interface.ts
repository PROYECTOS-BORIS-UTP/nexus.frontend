import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface ICentroCostoListadoRequest extends IPaginationRequest {
    iIdCentroCosto?: number | null;
    iIdCompania?: number | null;
    vCodigo?: string | null;
    vNombre?: string | null;
    bActivo?: boolean | null;
}