export interface IOpcionCreateUpdateRequest {
    iIdOpcion: number;
    iIdOpcionP?: number | null;
    vCodigo?: string | null;
    vOpcion: string;
    vDescripcion?: string | null;
    vRuta?: string | null;
    iIdTipoOpcion: number;
    bActivo: boolean;
    vIcono?: string | null;
    vTitulo?: string | null;
    vTooltip?: string | null;
    vColor?: string | null;
}