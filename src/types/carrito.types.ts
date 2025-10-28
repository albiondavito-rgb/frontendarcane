// Tipos para el Carrito del Backend

export interface CarritoItemDto {
  id: number;
  productoId: number;
  nombreProducto: string;
  imagenProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  stockDisponible: number;
  nombreNegocio: string;
}

export interface CarritoDto {
  id: number;
  usuarioId: number | null;
  estado: string;
  fechaCreacion: string;
  fechaUltimaModificacion: string;
  items: CarritoItemDto[];
  total: number;
}

export interface AgregarProductoDto {
  productoId: number;
  cantidad: number;
}

export interface ActualizarCantidadDto {
  productoId: number;
  cantidad: number;
}
