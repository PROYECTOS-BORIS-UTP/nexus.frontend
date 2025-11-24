import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IRequerimientoServicioListadoRequest extends IPaginationRequest {
    iIdCompania?: number;
    vSerie?: string;
    vNumero?: string;
    sTerminoBusqueda?: string;
    iIdUsuarioSolicitante?: number;
    iIdCentroCosto?: number;
    iIdEstado?: number;
    dFechaSolicitudInicio?: string;
    dFechaSolicitudFin?: string;
}