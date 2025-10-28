// Este archivo contendrá las funciones para interactuar con los endpoints de autenticación (login, register, etc.)
import { ENDPOINTS } from "./endpoints";
import type { RegisterPayload, LoginPayload } from "../types/auth.types";

const handleApiError = async (response: Response) => {
    const errorData = await response.json();
    // Lanzamos el objeto de error completo que viene del backend (ej. { errors: { Email: ["msg"] } }).
    // Esto permite al formulario identificar qué campo tiene el error.
    throw errorData;
};


/**
 * @description Llama al endpoint de registro de la API.
 * @param payload - Datos del usuario para el registro (nombre, email, password, etc.).
 * @returns La respuesta del servidor.
 * @throws Si la respuesta de la red no es exitosa, lanza un error con el mensaje del backend.
 */
export const register = async (payload: RegisterPayload) => {
    const response = await fetch(ENDPOINTS.USUARIOS.REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Llama al endpoint de login de la API.
 * @param payload - Credenciales del usuario (email, password).
 * @returns La respuesta del servidor, que debería incluir el token y los datos del usuario.
 * @throws Si la respuesta de la red no es exitosa, lanza un error con el mensaje del backend.
 */
export const login = async (payload: LoginPayload) => {
    const response = await fetch(ENDPOINTS.USUARIOS.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // ¡Importante! Para enviar y recibir cookies de sesión.
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Obtiene los datos del usuario autenticado usando la cookie de sesión.
 * @returns Los datos del perfil del usuario, o null si no está autenticado.
 * @throws Si la respuesta de la red no es exitosa (y no es un 401 Unauthorized).
 */
export const getMe = async () => {
    const response = await fetch(ENDPOINTS.USUARIOS.ME, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // ¡Importante! Envía la cookie de sesión.
    });

    if (!response.ok) {
        // Si el status es 401 (Unauthorized), significa que el usuario no está logueado.
        // En este caso, devolvemos null para que el AuthContext pueda manejar este estado.
        if (response.status === 401) {
            return null;
        }
        // Para otros errores (500, etc.), sí lanzamos el error.
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Llama al endpoint de logout para invalidar la cookie de sesión en el backend.
 * @returns La respuesta del servidor.
 * @throws Si la respuesta de la red no es exitosa.
 */
export const logout = async () => {
    const response = await fetch(ENDPOINTS.USUARIOS.LOGOUT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // ¡Importante! Envía la cookie de sesión para que el backend sepa a quién desloguear.
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};
