/*
 * Representa la estructura estándar de respuesta de la API.
 * @template T El tipo de dato contenido en la propiedad 'aData'.
 */
export interface IApiResponse<T> {
    bStatus: boolean
    vStatus: number;
    vMessage: string;
    aData: T;
}