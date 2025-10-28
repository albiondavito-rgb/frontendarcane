import { ENDPOINTS } from './endpoints';
import type { CheckoutData, PedidoCreadoDto } from '../types/checkout.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Procesa el checkout y crea el pedido
 */
export const processCheckout = async (data: CheckoutData): Promise<PedidoCreadoDto> => {
  const response = await fetch(ENDPOINTS.PEDIDOS.CHECKOUT, {
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
