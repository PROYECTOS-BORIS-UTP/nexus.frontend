export interface ICompaniaCreateUpdateRequest {
    iIdCompania?: number;
    vCodigo: string;
    vRUC: string;
    vRazonSocial: string;
    vAbreviatura: string;
    iIdUbigeo: number;
    vDireccion: string;
    vLogoData?: string | null;
    bActivo: boolean;
}