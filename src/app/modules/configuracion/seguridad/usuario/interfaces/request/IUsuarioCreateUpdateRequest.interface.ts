

export interface IUsuarioCreateUpdateRequest{

    iIdUsuario?: number ;
    vUsuario: string;
    vPassword?: string | null; // <-- Cambiado a string | null para recibir texto plano
    bActivo: boolean;
    iIdTipoUsuario: number;
    iIdPersona?: number | null;
    iIdTipoPersona: number;
    bChangePassword: boolean;

}