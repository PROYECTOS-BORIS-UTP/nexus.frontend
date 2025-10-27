/*
 * Interfaz genérica para definir la estructura de datos en respuestas paginadas.
 * @template T El tipo de los registros individuales en la página.
 */
export interface IPaginationResponse<T> {
    aRecords: T[]; 
    iTotalRecords: number;
}