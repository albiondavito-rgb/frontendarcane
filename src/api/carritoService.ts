import { ENDPOINTS } from './endpoints';
import type { CarritoDto, AgregarProductoDto, ActualizarCantidadDto } from '../types/carrito.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene el carrito del usuario (o crea uno si no existe)
 */
export const getCarrito = async (usuarioId?: number): Promise<CarritoDto> => {
  const response = await fetch(ENDPOINTS.CARRITO.GET(usuarioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Agrega un producto al carrito
 */
export const addProductToCarrito = async (
  data: AgregarProductoDto,
  usuarioId?: number
): Promise<CarritoDto> => {
  const response = await fetch(ENDPOINTS.CARRITO.ADD_PRODUCT(usuarioId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export const updateCarritoQuantity = async (
  data: ActualizarCantidadDto,
  usuarioId?: number
): Promise<CarritoDto> => {
  const response = await fetch(ENDPOINTS.CARRITO.UPDATE_QUANTITY(usuarioId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Elimina un item del carrito
 */
export const deleteCarritoItem = async (
  itemId: number,
  usuarioId?: number
): Promise<void> => {
  const response = await fetch(ENDPOINTS.CARRITO.DELETE_ITEM(itemId, usuarioId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Vacía el carrito completamente
 */
export const clearCarrito = async (usuarioId?: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.CARRITO.CLEAR(usuarioId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};
