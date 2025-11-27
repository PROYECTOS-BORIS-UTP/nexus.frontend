export interface IProveedorListadoRequest {
    iIdProveedor?: number;
    vRUC?: string;
    vRazonSocial?: string;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}