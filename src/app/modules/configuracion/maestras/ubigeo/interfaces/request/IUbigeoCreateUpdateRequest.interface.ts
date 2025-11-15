export interface IUbigeoCreateUpdateRequest {
    iIdUbigeo: number;
    vCodigo: string;
    vDescripcion: string;
    iIdUbigeoPadre?: number | null;
    iIdTipoUbigeo: number;
    iIdPais: number;
    bActivo: boolean;
}