export interface IAlmacenCreateUpdateRequest {
    iIdAlmacen: number;
    iIdCompania: number;
    vCodigo: string;
    vNombre: string;
    vDireccion?: string | null;
    iIdUbigeo?: number | null;
    bActivo: boolean;
}