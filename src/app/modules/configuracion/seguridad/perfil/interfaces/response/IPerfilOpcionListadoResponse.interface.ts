export interface IPerfilOpcionListadoResponse {
    iIdOpcion: number;
    iIdOpcionP: number | null;
    vCodigo: string | null;
    vOpcion: string;
    vDescripcion: string | null;
    vRuta: string | null;
    iIdTipoOpcion: number;
    vIcono: string | null;
    vTitulo: string;
    vTooltip: string | null;
    vColor: string | null;
    bAcceso_visualizar: boolean;
    bAcceso_crear: boolean;
    bAcceso_actualizar: boolean;
    bAcceso_eliminar: boolean;
    // Propiedad 'hijos' añadida para el árbol anidado
    hijos?: IPerfilOpcionListadoResponse[];
}