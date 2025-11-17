import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IPerfilUsuarioListadoRequest extends IPaginationRequest {
    iIdUsuario: number;
    iIdCompania: number;
}