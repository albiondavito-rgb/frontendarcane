// Tipos para el proceso de Checkout

export interface DatosFactura {
  nombre: string;
  ciNit: string;
  correo: string;
  numero: string;
}

export interface CheckoutData {
  carritoId: number;
  metodoPago: 'QR' | 'Tarjeta';
  datosFactura: DatosFactura;
  direccionEntrega: string;
  usuarioId?: number;
}

export interface PedidoCreadoDto {
  pedidoId: number;
  estado: string;
  montoTotal: number;
  mensaje: string;
}

// Para factura
export interface FacturaDto {
  id: number;
  pedidoId: number;
  numeroFactura: string;
  nombreFacturacion: string;
  ciNitFacturacion: string;
  emailFacturacion: string;
  telefonoFacturacion: string;
  fechaEmision: string;
}
