import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

/*
 * Representa el cuerpo de la solicitud para la API ListadoElementosSistema.
 * Extiende IPaginationRequest y añade filtros específicos.
 */
export interface IElementoSistemaListadoRequest extends IPaginationRequest {
    iIdElemento?: number | null;
    iIdElementoPadre?: number | null;
    sTerminoBusqueda?: string | null;
    iIdTipoElemento?: number | null;
    iIdCompania?: number | null;
    iIdPais?: number | null;
    bActivo?: boolean | null;
}