import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IRequerimientoCompraDetalleListadoRequest extends IPaginationRequest {
    iIdRequerimientoCompra: number;
}