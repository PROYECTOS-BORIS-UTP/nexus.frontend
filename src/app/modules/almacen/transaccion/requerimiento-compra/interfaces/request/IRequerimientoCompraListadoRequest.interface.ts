import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IRequerimientoCompraListadoRequest extends IPaginationRequest {
    iIdCompania?: number | null;
    vSerie?: string | null;
    sTerminoBusqueda?: string | null; // Mapeado a vNumero
    iIdUsuarioSolicitante?: number | null;
    iIdCentroCosto?: number | null;
    iIdEstado?: number | null;
    dFechaSolicitudInicio?: string | null;
    dFechaSolicitudFin?: string | null;
}