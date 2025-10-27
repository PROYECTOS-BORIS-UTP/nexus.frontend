import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

/*
 * Representa el cuerpo de la solicitud para la API ListadoUsuario.
 * Extiende IPaginationRequest y añade filtros específicos.
 */
export interface IUsuarioListadoRequest extends IPaginationRequest {
    iIdUsuario?: number;
    sTerminoBusqueda?: string;
    bActivo?: boolean;
    iIdTipoUsuario?: number;
    iIdTipoPersona?: number;
}