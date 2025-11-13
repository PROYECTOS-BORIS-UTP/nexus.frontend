import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IMovimientoListadoRequest extends IPaginationRequest {
    iIdAlmacen: number;
    iIdProducto: number;
    dFechaInicio?: string | null;
    dFechaFin?: string | null;
    iIdTipoMovimiento?: number | null;
    bActivo?: boolean | null;
}