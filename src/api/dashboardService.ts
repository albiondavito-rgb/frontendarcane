import { ENDPOINTS } from './endpoints';
import type {
  DashboardPedidosStats,
  DashboardProductosStats,
  DashboardGananciasStats,
  DashboardCarritosStats
} from '../types/dashboard.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene estadísticas de pedidos para un negocio
 */
export const getPedidosStats = async (negocioId: number): Promise<DashboardPedidosStats> => {
  const response = await fetch(ENDPOINTS.DASHBOARD.GET_PEDIDOS_STATS(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene estadísticas de productos para un negocio
 */
export const getProductosStats = async (negocioId: number): Promise<DashboardProductosStats> => {
  const response = await fetch(ENDPOINTS.DASHBOARD.GET_PRODUCTOS_STATS(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene estadísticas de ganancias para un negocio
 */
export const getGananciasStats = async (negocioId: number): Promise<DashboardGananciasStats> => {
  const response = await fetch(ENDPOINTS.DASHBOARD.GET_GANANCIAS_STATS(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene estadísticas de carritos para un negocio
 */
export const getCarritosStats = async (negocioId: number): Promise<DashboardCarritosStats> => {
  const response = await fetch(ENDPOINTS.DASHBOARD.GET_CARRITOS_STATS(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
