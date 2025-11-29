import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IOrdenCompraDetalleListadoRequest extends IPaginationRequest {
    iIdOrdenCompra: number;
}