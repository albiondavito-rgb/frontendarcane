import { ENDPOINTS } from './endpoints';
import type { AdminBusiness } from '../types/admin.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene todos los negocios para administración
 */
export const getAllBusinesses = async (buscar?: string): Promise<AdminBusiness[]> => {
  const url = buscar 
    ? `${ENDPOINTS.ADMIN.NEGOCIOS.GET_ALL}?buscar=${encodeURIComponent(buscar)}`
    : ENDPOINTS.ADMIN.NEGOCIOS.GET_ALL;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene negocios pendientes de aprobación
 */
export const getPendingBusinesses = async (): Promise<AdminBusiness[]> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.PENDIENTES, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Aprueba un negocio
 */
export const approveBusiness = async (businessId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.APROBAR(businessId), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Rechaza un negocio
 */
export const rejectBusiness = async (businessId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.RECHAZAR(businessId), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Elimina un negocio
 */
export const deleteBusiness = async (businessId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.ADMIN.NEGOCIOS.DELETE(businessId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};


