import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

/*
 * Representa el cuerpo de la solicitud para la API ListadoPersonas.
 * Extiende IPaginationRequest y añade filtros específicos.
 */
export interface IPersonaListadoRequest extends IPaginationRequest {
    iIdPersona?: number | null;
    iIdTipoPersona?: number | null;
    sTerminoBusqueda?: string | null;
    vDNIFiltro?: string | null;
    vRUCFiltro?: string | null;
    bActivo?: boolean | null;
}