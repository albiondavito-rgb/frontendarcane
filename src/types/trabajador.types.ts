// Tipos para Trabajadores

export interface TrabajadorDto {
  id: number;
  negocioId: number;
  usuarioId: number;
  nombreCompleto: string;
  nombre?: string; // Añadido
  apellido?: string; // Añadido
  email: string;
  telefono: string;
  nombreNegocio: string;
}

export interface TrabajadorCreateDto {
  negocioId: number;
  email: string;
}
