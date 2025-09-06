// --- Para el cuerpo de la petición POST /login ---
export interface IAuthenticactionRequest {
    vUsuario    : string;
    vPassword   : string;
}

// --- Para el objeto 'user' que viene dentro de la respuesta ---
export interface IUser {
    iIdUsuario      : number;
    vUsuario        : string;
    iIdTipoUsuario  : number;
    iIdTipoPersona  : number;
    iIdPersona      : number;
}

// --- Para el objeto 'aData' en una respuesta de login exitosa ---
export interface IAuthenticationResponse {
    user    : IUser;
    token   : string;
}