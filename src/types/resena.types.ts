// Tipos para Reseñas

export interface ResenaDto {
  id: number;
  productoId: number;
  nombreUsuario: string;
  calificacion: number;
  comentario: string;
  fechaResena: string;
}

export interface ResenaCreateDto {
  productoId: number;
  usuarioId: number;
  calificacion: number;
  comentario: string;
}
