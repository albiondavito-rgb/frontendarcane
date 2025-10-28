
import { ENDPOINTS } from "./endpoints";
import type { UpdatePasswordPayload, UpdateEmailPayload, UpdateTelefonoPayload } from "../types/user.types";

const handleApiError = async (response: Response) => {
    const errorData = await response.json();
    throw errorData;
};

/**
 * @description Llama al endpoint para actualizar el email del usuario.
 * @param userId - El ID del usuario a actualizar.
 * @param payload - El objeto que contiene el nuevo email.
 * @returns La respuesta del servidor.
 */
export const updateEmail = async (userId: number, payload: UpdateEmailPayload) => {
    const response = await fetch(ENDPOINTS.USUARIOS.UPDATE_EMAIL(userId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Enviar cookies de sesión
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Llama al endpoint para cambiar la contraseña del usuario.
 * @param userId - El ID del usuario a actualizar.
 * @param payload - El objeto que contiene la contraseña actual y la nueva.
 * @returns La respuesta del servidor.
 */
export const updatePassword = async (userId: number, payload: UpdatePasswordPayload) => {
    const response = await fetch(ENDPOINTS.USUARIOS.UPDATE_PASSWORD(userId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Enviar cookies de sesión
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Llama al endpoint para actualizar el teléfono del usuario.
 * @param userId - El ID del usuario a actualizar.
 * @param payload - El objeto que contiene el nuevo teléfono.
 * @returns La respuesta del servidor.
 */
export const updateTelefono = async (userId: number, payload: UpdateTelefonoPayload) => {
    const response = await fetch(ENDPOINTS.USUARIOS.UPDATE_TELEFONO(userId), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};
