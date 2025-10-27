/*
 * Representa la estructura de una persona devuelta por la API ListadoPersonas.
 * Coincide con PersonaListadoResponseDto del backend.
 */
export interface IPersonaResponse {
    iIdPersona: number;
    iIdTipoPersona: number;
    vPrimerNombre: string;
    vSegundoNombre: string | null;
    vApellidoPaterno: string;
    vApellidoMaterno: string;
    vNombreCompleto: string;
    dFechaNacimiento: Date | string | null;
    iIdUbigeoNacimiento: number | null;
    iIdGenero: number | null;
    iIdEstadoCivil: number | null;
    vCorreo: string | null;
    vCelular1: string | null;
    vCelular2: string | null;
    vTelefono: string | null;
    vDNI: string | null;
    vCE: string | null;
    vRUC: string | null;
    bActivo: boolean;
}