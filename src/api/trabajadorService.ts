import { ENDPOINTS } from './endpoints';
import type { TrabajadorDto, TrabajadorCreateDto } from '../types/trabajador.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene todos los trabajadores de un negocio
 */
export const getTrabajadoresPorNegocio = async (negocioId: number): Promise<TrabajadorDto[]> => {
  const response = await fetch(ENDPOINTS.TRABAJADORES.GET_BY_NEGOCIO(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Crea un nuevo trabajador
 */
export const createTrabajador = async (
  emprendedorId: number,
  trabajadorData: TrabajadorCreateDto
): Promise<TrabajadorDto> => {
  const response = await fetch(ENDPOINTS.TRABAJADORES.CREATE(emprendedorId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(trabajadorData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Elimina un trabajador
 */
export const deleteTrabajador = async (id: number, emprendedorId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.TRABAJADORES.DELETE(id, emprendedorId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};
