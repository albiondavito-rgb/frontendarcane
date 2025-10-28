import { ENDPOINTS } from './endpoints';
import type { FacturaDto } from '../types/checkout.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene la factura asociada a un pedido
 */
export const getFacturaPorPedido = async (pedidoId: number): Promise<FacturaDto> => {
  const response = await fetch(ENDPOINTS.FACTURAS.GET_BY_PEDIDO(pedidoId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Descarga el PDF de la factura asociada a un pedido
 */
export const descargarFacturaPdf = async (pedidoId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.FACTURAS.GET_PDF_BY_PEDIDO(pedidoId), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  // Extraer el nombre del archivo de la cabecera Content-Disposition si está disponible
  const disposition = response.headers.get('content-disposition');
  let filename = 'factura.pdf'; // Nombre por defecto
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
