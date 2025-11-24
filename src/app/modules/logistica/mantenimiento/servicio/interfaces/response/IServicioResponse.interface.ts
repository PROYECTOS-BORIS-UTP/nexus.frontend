export interface IServicioResponse {
    iIdServicio: number;
    vTitulo: string;
    vDescripcion: string;
    bActivo: boolean;
    iUsuarioCrea: number;
    dFechaCrea: Date;
    iUsuarioModifica: number;
    dFechaModifica: Date;
}