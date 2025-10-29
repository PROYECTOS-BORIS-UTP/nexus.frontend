export interface IElementoSistemaCreateUpdateRequest {
    iIdElemento?: number;
    iIdElementoPadre?: number | null;
    vCodigo: string;
    vAbreviatura: string;
    vDescripcion: string;
    iSubGrupo: number;
    bActivo: boolean;
    iIdTipoElemento: number;
    iIdCompania: number;
    iIdPais: number;
}