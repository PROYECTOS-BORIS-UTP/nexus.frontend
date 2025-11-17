/*
 * DTO para asignar un perfil a un usuario en una compañía.
 */
export interface IPerfilUsuarioCreateRequest {
    iIdUsuario: number;
    iIdPerfil: number;
    iIdCompania: number;
}