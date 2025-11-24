export interface IFamiliaListadoRequest {
    iIdFamilia?: number;
    vTitulo?: string;
    vSigla?: string;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}