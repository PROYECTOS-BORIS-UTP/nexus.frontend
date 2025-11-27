export interface IProveedorContactoListadoRequest {
    iIdContacto?: number;
    iIdProveedor?: number;
    vNombreCompleto?: string;
    bActivo?: boolean;
    iPageNumber: number;
    iPageSize: number;
}