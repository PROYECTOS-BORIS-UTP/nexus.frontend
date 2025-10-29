export interface IPersonaCreateUpdateRequest {
    iIdPersona?: number; // Es opcional para la creación, requerido para actualización
    iIdTipoPersona: number;
    vPrimerNombre: string;
    vSegundoNombre?: string | null;
    vApellidoPaterno: string;
    vApellidoMaterno: string;
    dFechaNacimiento?: string | null; // Mantener como string YYYY-MM-DD
    iIdUbigeoNacimiento?: number | null;
    iIdGenero?: number | null;
    iIdEstadoCivil?: number | null;
    vCorreo?: string | null;
    vCelular1?: string | null;
    vCelular2?: string | null;
    vTelefono?: string | null;
    vDNI?: string | null;
    vCE?: string | null;
    vRUC?: string | null;
    bActivo: boolean;
}