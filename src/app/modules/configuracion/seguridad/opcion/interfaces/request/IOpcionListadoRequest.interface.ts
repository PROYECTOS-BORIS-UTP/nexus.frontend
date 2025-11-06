import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IOpcionListadoRequest extends IPaginationRequest {
    iIdOpcion?: number | null;
    iIdOpcionP?: number | null;
    vOpcionFiltro?: string | null;
    vCodigoFiltro?: string | null;
    iIdTipoOpcion?: number | null;
    bActivo?: boolean | null;
}