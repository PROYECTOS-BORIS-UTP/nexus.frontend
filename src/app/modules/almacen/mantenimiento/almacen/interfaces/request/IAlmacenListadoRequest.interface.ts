import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IAlmacenListadoRequest extends IPaginationRequest {
    iIdAlmacen?: number;
    iIdCompania?: number;
    vCodigo?: string;
    vNombre?: string;
    bActivo?: boolean;
}