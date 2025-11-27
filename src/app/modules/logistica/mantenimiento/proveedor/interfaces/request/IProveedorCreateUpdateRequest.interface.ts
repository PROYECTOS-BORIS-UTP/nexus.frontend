export interface IProveedorCreateUpdateRequest {
    iIdProveedor?: number;
    vRUC: string;
    vRazonSocial: string;
    vDireccion?: string;
    bActivo: boolean;
}