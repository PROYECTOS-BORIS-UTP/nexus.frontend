/*
 * Interfaz genérica para opciones de selects/combos.
 */
export interface ISelectItem<T = number | string> {
    iIdElemento: T;
    vDescripcion: string;
}