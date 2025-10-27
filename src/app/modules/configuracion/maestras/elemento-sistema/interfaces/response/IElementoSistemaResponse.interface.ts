/*
 * Representa la estructura de un Elemento del Sistema devuelta por la API.
 * Coincide con ElementoSistemaListadoResponseDto del backend.
 */
export interface IElementoSistemaResponse {
    iIdElemento: number;
    iIdElementoPadre: number | null;
    vCodigo: string;
    vAbreviatura: string;
    vDescripcion: string;
    iSubGrupo: number;
    bActivo: boolean;
    iIdTipoElemento: number;
    iIdCompania: number;
    iIdPais: number;
}