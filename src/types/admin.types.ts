// Tipos para el panel de administrador

export interface AdminUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  roles: string[];
  fechaCreacion: string;
}

export interface AdminUserCreateDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
  roles: string[];
}

export interface AdminUserUpdateDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  roles: string[];
}

export interface AdminBusiness {
  id: number;
  usuarioId: number;
  nombre: string;
  telefonoNegocio: string;
  ubicacion: string;
  detalles: string;
  imagenPerfilUrl: string;
  estado: string;
  fechaCreacion: string;
}

export interface AdminCategory {
  id: number;
  nombre: string;
  imagenUrl: string;
  estaActiva: boolean;
}

export interface CategoryCreateDto {
  nombre: string;
  imagen: File;
}

export interface CategoryUpdateDto {
  nombre: string;
  imagen?: File;
}

export interface Transaction {
  id: number;
  fechaPedido: string;
  cliente: string;
  email: string;
  montoTotal: number;
  estadoGeneral: string;
  cantidadNegocios: number;
  negocios: string[];
}

export interface TransactionDetail {
  pedidoId: number;
  usuarioId: number;
  fechaPedido: string;
  montoTotal: number;
  direccionEnvio: string;
  metodoPago: string;
  estadoGeneral: string;
  paquetesPorNegocio: {
    pedidoNegocioId: number;
    negocioId: number;
    nombreNegocio: string;
    totalNegocio: number;
    comisionPlataforma: number;
    estado: string;
    items: {
      productoId: number;
      nombreProducto: string;
      cantidad: number;
      precioCompra: number;
    }[];
  }[];
}
