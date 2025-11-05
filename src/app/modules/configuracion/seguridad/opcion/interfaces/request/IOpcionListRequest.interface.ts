import { IPaginationRequest } from "../../../../../../core/interfaces/IPaginationRequest.interface";

export interface IOpcionListRequest extends IPaginationRequest {
    iIdOpcionP: number | null;
    bActivo: boolean;
}