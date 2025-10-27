/*
 * Representa la estructura de una compañía devuelta por la API ListadoCompanias.
 * Coincide con CompaniaListadoResponseDto del backend.
 */
export interface ICompaniaResponse {
    iIdCompania: number;
    vCodigo: string;
    vRUC: string;
    vRazonSocial: string;
    vAbreviatura: string;
    iIdUbigeo: number;
    vDireccion: string;
    vLogoData: string | null;
    bActivo: boolean;
    iUsuarioCrea: number;
    iUsuarioModifica: number;
}