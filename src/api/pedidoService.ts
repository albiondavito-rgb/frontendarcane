import { ENDPOINTS } from './endpoints';
import type { PedidoHistorialDto, PedidoDetalleDto, PedidoNegocioDto, PedidoHistorialDetalleDto } from '../types/pedido.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene todos los pedidos de un negocio
 */
export const getPedidosPorNegocio = async (negocioId: number): Promise<PedidoNegocioDto[]> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_BY_NEGOCIO(negocioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene el historial de pedidos de un usuario (cliente)
 */
export const getPedidosPorUsuario = async (usuarioId: number): Promise<PedidoHistorialDto[]> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_BY_USUARIO(usuarioId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene el detalle completo de un pedido
 */
export const getPedidoDetalle = async (pedidoId: number): Promise<PedidoDetalleDto> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_DETALLE(pedidoId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Obtiene el detalle completo de un historial de pedido para el cliente
 */
export const getPedidoHistorialDetalle = async (usuarioId: number, pedidoId: number): Promise<PedidoHistorialDetalleDto> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.GET_HISTORIAL_DETALLE(usuarioId, pedidoId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Actualiza el estado de un pedido del negocio
 */
export const updatePedidoEstado = async (
  pedidoNegocioId: number,
  nuevoEstado: string
): Promise<void> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.UPDATE_ESTADO(pedidoNegocioId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nuevoEstado }),
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};
