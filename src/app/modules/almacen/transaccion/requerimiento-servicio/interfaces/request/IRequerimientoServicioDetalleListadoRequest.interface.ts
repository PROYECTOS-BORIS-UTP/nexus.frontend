import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IRequerimientoServicioDetalleListadoRequest extends IPaginationRequest {
    iIdRequerimientoServicio: number;
}