import { ENDPOINTS } from './endpoints';
import type { MetodoPago, MetodoPagoCreate } from '../types/metodoPago.types';

// Helper para manejar errores de la API de forma consistente
const handleApiError = async (response: Response) => {
    const errorData = await response.json();
    throw errorData;
};

/**
 * @description Obtiene todos los métodos de pago para un cliente específico.
 * @param clienteId - El ID del cliente.
 * @returns Una promesa que se resuelve en un array de métodos de pago.
 */
export const getMetodosPago = async (clienteId: number): Promise<MetodoPago[]> => {
    const response = await fetch(ENDPOINTS.METODOS_PAGO.BASE(clienteId), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Esencial para enviar la cookie de sesión
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Añade un nuevo método de pago para un cliente.
 * @param clienteId - El ID del cliente.
 * @param data - Los datos de la nueva tarjeta a crear.
 * @returns Una promesa que se resuelve con el método de pago recién creado.
 */
export const addMetodoPago = async (clienteId: number, data: MetodoPagoCreate): Promise<MetodoPago> => {
    const response = await fetch(ENDPOINTS.METODOS_PAGO.BASE(clienteId), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        return handleApiError(response);
    }

    return await response.json();
};

/**
 * @description Elimina un método de pago específico de un cliente.
 * @param clienteId - El ID del cliente.
 * @param metodoId - El ID del método de pago a eliminar.
 */
export const deleteMetodoPago = async (clienteId: number, metodoId: number): Promise<void> => {
    const response = await fetch(ENDPOINTS.METODOS_PAGO.DELETE(clienteId, metodoId), {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        // No esperamos un cuerpo JSON en una respuesta de error de DELETE,
        // pero lo manejamos por si acaso.
        try {
            await handleApiError(response);
        } catch (e) {
            throw new Error('Error al eliminar el método de pago.');
        }
    }
    // Una respuesta 204 No Content no tendrá cuerpo, por lo que no hacemos response.json()
};
