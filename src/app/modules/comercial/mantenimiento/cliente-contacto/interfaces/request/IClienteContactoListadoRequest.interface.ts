import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IClienteContactoListadoRequest extends IPaginationRequest {
    iIdClienteContacto?: number;
    iIdCliente?: number;
    vNombreCompleto?: string;
    bActivo?: boolean;
}