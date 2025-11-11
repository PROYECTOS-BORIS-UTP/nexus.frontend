export interface IAlmacenResponse {
    iIdAlmacen: number;
    iIdCompania: number;
    vCodigo: string;
    vNombre: string;
    vDireccion: string | null;
    iIdUbigeo: number | null;
    vUbigeoNombre: string | null;
    bActivo: boolean;
}