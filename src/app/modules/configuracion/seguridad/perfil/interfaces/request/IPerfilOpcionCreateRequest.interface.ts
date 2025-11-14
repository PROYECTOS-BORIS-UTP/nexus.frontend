export interface IPerfilOpcionCreateRequest {
    iIdPerfil: number;
    iIdOpcion: number;
    bAcceso_visualizar: boolean;
    bAcceso_crear: boolean;
    bAcceso_actualizar: boolean;
    bAcceso_eliminar: boolean;
}