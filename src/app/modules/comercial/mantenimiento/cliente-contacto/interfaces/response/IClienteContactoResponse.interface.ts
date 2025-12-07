export interface IClienteContactoResponse {
    iIdClienteContacto: number;
    iIdCliente: number;
    vClienteNombre: string;
    vNombreCompleto: string;
    vCargo: string;
    vCelular: string;
    vCorreo: string;
    bEsPrincipal: boolean;
    bActivo: boolean;
    iTotalRecords: number;
}