import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IClienteListadoRequest extends IPaginationRequest {
    iIdCliente?: number;
    iIdCompania?: number;
    vNumeroDocumento?: string;
    vRazonSocial?: string;
    bActivo?: boolean;
}