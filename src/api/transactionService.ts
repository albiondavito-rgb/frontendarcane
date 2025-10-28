import { ENDPOINTS } from './endpoints';
import type { Transaction, TransactionDetail } from '../types/admin.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene el detalle de un pedido
 */
export const getOrderDetail = async (orderId: number): Promise<TransactionDetail> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_DETALLE(orderId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene pedidos por usuario
 */
export const getOrdersByUser = async (userId: number): Promise<Transaction[]> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_BY_USUARIO(userId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene pedidos por negocio
 */
export const getOrdersByBusiness = async (businessId: number): Promise<Transaction[]> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_BY_NEGOCIO(businessId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Actualiza el estado de un pedido de negocio
 */
export const updateOrderStatus = async (orderBusinessId: number, newStatus: string): Promise<void> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.UPDATE_ESTADO(orderBusinessId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nuevoEstado: newStatus }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Obtiene todos los pedidos para el panel de administración con filtros
 */
export const getAllPedidosAdmin = async (filters: { 
  fechaInicio?: string; 
  fechaFin?: string; 
  cliente?: string; 
  estado?: string; 
  montoMinimo?: number;
  montoMaximo?: number;
} = {}): Promise<Transaction[]> => {
  const queryParams = new URLSearchParams();
  if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
  if (filters.cliente) queryParams.append('cliente', filters.cliente);
  if (filters.estado && filters.estado !== 'all') queryParams.append('estado', filters.estado);
  if (filters.montoMinimo) queryParams.append('montoMinimo', filters.montoMinimo.toString());
  if (filters.montoMaximo) queryParams.append('montoMaximo', filters.montoMaximo.toString());

  const url = `${ENDPOINTS.ADMIN.PEDIDOS.GET_ALL}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};


