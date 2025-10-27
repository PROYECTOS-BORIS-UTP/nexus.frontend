import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

/*
 * Representa el cuerpo de la solicitud para la API ListadoPerfil.
 * Extiende IPaginationRequest y añade filtros específicos.
 */
export interface IPerfilListadoRequest extends IPaginationRequest {
    iIdPerfil?: number | null;
    sTerminoBusqueda?: string | null;
    bActivo?: boolean | null;
}