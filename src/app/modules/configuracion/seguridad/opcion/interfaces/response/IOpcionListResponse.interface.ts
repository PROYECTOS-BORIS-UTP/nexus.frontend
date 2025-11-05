export interface IOpcionListResponse {
    iIdOpcion: number;
    iIdOpcionP: number | null;
    vCodigo: string;
    vOpcion: string;
    vDescripcion: string | null;
    vRuta: string | null;
    iIdTipoOpcion: number;
    bActivo: boolean;
    vIcono: string;
    vTitulo: string;
    vTooltip: string;
    vColor: string;
    TotalRecords: number; // Esta propiedad parece estar en cada ítem, según el JSON
}