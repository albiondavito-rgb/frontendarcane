import { ENDPOINTS } from './endpoints';
import type { ResenaDto, ResenaCreateDto } from '../types/resena.types';

const handleApiError = async (response: Response) => {
  const errorText = await response.text();
  throw new Error(errorText);
};

/**
 * Obtiene todas las reseñas de un producto
 */
export const getResenasPorProducto = async (productoId: number): Promise<ResenaDto[]> => {
  const response = await fetch(ENDPOINTS.RESENAS.GET_BY_PRODUCTO(productoId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Crea una nueva reseña
 */
export const createResena = async (resenaData: ResenaCreateDto): Promise<ResenaDto> => {
  const response = await fetch(ENDPOINTS.RESENAS.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(resenaData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
