export interface IClienteContactoCreateUpdateRequest {
    iIdClienteContacto?: number;
    iIdCliente: number;
    vNombreCompleto: string;
    vCargo?: string;
    vCelular?: string;
    vCorreo: string;
    bEsPrincipal: boolean;
    bActivo: boolean;
}