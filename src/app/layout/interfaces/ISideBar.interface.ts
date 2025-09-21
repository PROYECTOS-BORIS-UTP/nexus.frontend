/*
 * @description Define la estructura para el cuerpo de la petición
 * para obtener las opciones del menú por usuario.
 */
export interface IOpcionByUserRequest {
    iIdUsuario: number;
}

/*
 * @description Define la estructura de una opción de menú en la respuesta de la API.
 */
export interface IOpcionByUserResponse {
    iIdOpcion: number;
    iIdOpcionP: number | null;
    vOpcion: string;
    vRuta: string;
    vIcono: string;
    vTitulo: string;
    vTooltip: string;
    vColor: string;
    children: IOpcionByUserResponse[];
}