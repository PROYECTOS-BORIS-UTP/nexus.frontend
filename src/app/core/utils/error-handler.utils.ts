import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/*
 * Manejador centralizado de errores HTTP para servicios.
 * Extrae un mensaje de error significativo de la respuesta.
 * @param error El objeto HttpErrorResponse.
 * @returns Un Observable que emite un error con el mensaje procesado.
 */
export function handleHttpError(error: HttpErrorResponse): Observable<never> {
    console.error('Error en la llamada HTTP:', error);

    let errorMessage = 'Ocurrió un error inesperado en el servidor.';

    if (error.error) {
        if (typeof error.error.message === 'string') {
            errorMessage = error.error.message;
        }
        else if (typeof error.error.vMessage === 'string') {
            errorMessage = error.error.vMessage;
        }
        else if (typeof error.error === 'string') {
            errorMessage = error.error;
        }
    } else if (error.message) {
        errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
}