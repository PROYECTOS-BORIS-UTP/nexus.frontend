export interface IProveedorContactoCreateUpdateRequest {
    iIdContacto?: number;
    iIdProveedor: number;
    vNombreCompleto: string;
    vCargo?: string;
    vCelular?: string;
    vCorreo?: string;
    bActivo: boolean;
}