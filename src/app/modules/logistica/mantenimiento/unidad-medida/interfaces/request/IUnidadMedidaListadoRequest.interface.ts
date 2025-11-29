export interface IUnidadMedidaListadoRequest {
  iIdUnidadMedida?: number;
  vDescripcion?: string;
  vAbreviatura?: string;
  bActivo?: boolean;
  iPageNumber: number;
  iPageSize: number;
}
