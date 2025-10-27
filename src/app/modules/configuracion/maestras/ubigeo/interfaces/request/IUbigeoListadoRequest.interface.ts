import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IUbigeoListadoRequest extends IPaginationRequest {
    iIdUbigeo?: number | null;
    sTerminoBusqueda?: string | null;
    iIdUbigeoPadre?: number | null;
    iIdTipoUbigeo?: number | null;
    iIdPais?: number | null;
    bActivo?: boolean | null;
}