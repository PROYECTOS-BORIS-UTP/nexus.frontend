import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

/*
 * Representa el cuerpo de la solicitud para la API ListadoCompanias.
 * Extiende IPaginationRequest y añade filtros específicos.
 */
export interface ICompaniaListadoRequest extends IPaginationRequest {
    iIdCompania?: number | null;
    vRUC?: string | null;
    vRazonSocial?: string | null;
    bActivo?: boolean | null;
}