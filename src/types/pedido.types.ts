// Tipos para Pedidos del Negocio

export interface ClienteDto {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

export interface PedidoItemNegocioDto {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioCompra: number;
  subtotal: number;
}

export interface PedidoNegocioDto {
  pedidoNegocioId: number;
  pedidoId: number;
  fechaPedido: string;
  cliente: ClienteDto;
  totalNegocio: number;
  estado: string;
  items: PedidoItemNegocioDto[];
}

export interface UpdatePedidoEstadoDto {
  nuevoEstado: string;
}

// Para el historial de pedidos del cliente
export interface PedidoHistorialDto {
  pedidoId: number;
  numeroPedido: number;
  fechaPedido: string;
  montoTotal: number;
  estadoGeneral: string;
  cantidadNegocios: number;
  cantidadItems: number;
}

// Para el detalle completo de un pedido
export interface PedidoItemDetalleDto {
  productoId: number;
  nombreProducto: string;
  imagenUrl: string;
  cantidad: number;
  precioCompra: number;
  subtotal: number;
}

export interface PedidoNegocioDetalleDto {
  pedidoNegocioId: number;
  negocioId: number;
  nombreNegocio: string;
  totalNegocio: number;
  comisionPlataforma: number;
  estado: string;
  items: PedidoItemDetalleDto[];
}

export interface PedidoDetalleDto {
  pedidoId: number;
  numeroPedido: number;
  usuarioId: number;
  fechaPedido: string;
  montoTotal: number;
  direccionEnvio: string;
  metodoPago: string;
  estadoGeneral: string;
  paquetesPorNegocio: PedidoNegocioDetalleDto[];
}

// Tipos para el Historial de Compras Detallado del Cliente

export interface PedidoItemHistorialDto {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoHistorialDetalleDto {
  pedidoId: number;
  fechaPedido: string;
  nombreCompletoCliente: string;
  cantidadTotalProductos: number;
  totalPagado: number;
  metodoPago: string;
  razonSocial?: string;
  nit?: string;
  items: PedidoItemHistorialDto[];
}
