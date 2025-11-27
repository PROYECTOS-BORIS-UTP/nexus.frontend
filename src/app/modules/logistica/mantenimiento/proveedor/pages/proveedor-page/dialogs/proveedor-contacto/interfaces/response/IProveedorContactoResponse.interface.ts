export interface IProveedorContactoResponse {
    iIdContacto: number;
    iIdProveedor: number;
    vProveedorNombre: string;
    vNombreCompleto: string;
    vCargo: string;
    vCelular: string;
    vCorreo: string;
    bActivo: boolean;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    iUsuarioModifica: number;
    dFechaModifica: Date;
}