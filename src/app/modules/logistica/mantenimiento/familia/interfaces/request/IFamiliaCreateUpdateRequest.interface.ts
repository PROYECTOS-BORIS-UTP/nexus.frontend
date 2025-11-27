export interface IFamiliaCreateUpdateRequest {
    iIdFamilia?: number;
    vTitulo: string;
    vSigla: string;
    vCuentaContable?: string;
    bActivo: boolean;
}