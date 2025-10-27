export interface IUbigeoResponse {
    iIdUbigeo: number;
    vCodigo: string;
    vDescripcion: string;
    iIdUbigeoPadre: number | null;
    vUbigeoPadreDescripcion?: string | null;
    iIdTipoUbigeo: number;
    vTipoUbigeoDescripcion?: string;
    iIdPais: number;
    vPaisNombre?: string;
    bActivo: boolean;
}