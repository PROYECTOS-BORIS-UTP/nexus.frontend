/*
 * Interfaz genérica para definir los parámetros de solicitud de paginación.
 */
export interface IPaginationRequest {
    iPageNumber: number;
    iPageSize: number;
}