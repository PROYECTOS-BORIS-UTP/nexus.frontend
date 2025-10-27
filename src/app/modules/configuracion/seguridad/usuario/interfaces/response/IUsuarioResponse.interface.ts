/*
 * Representa la estructura de un usuario devuelta por la API ListadoUsuario.
 * Coincide con UsuarioResponseDto del backend.
 */
export interface IUsuarioResponse {
    iIdUsuario: number;
    vUsuario: string;
    bActivo: boolean;
    iIdTipoUsuario: number;
    iIdPersona: number;
    iIdTipoPersona: number;
    bChangePassword?: boolean;
}