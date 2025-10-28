export interface RegisterNegocioDto {
  nombre: string;
  descripcion: string;
  direccion: string;
  telefono: string;
  // La imagen se manejará como FormData, no aquí.
}

export type Business = {
  id: number;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  imagenUrl?: string;
  imagenPerfilUrl: string;
  imagenBannerUrl?: string;
  estado?: string;
  fechaRegistro?: string;
};

export interface Negocio {
  id: number; // Backend devuelve "Id"
  negocioId?: number; // Alias para compatibilidad
  usuarioId: number;
  nombre: string;
  telefonoNegocio?: string; // Backend usa este nombre
  telefono?: string; // Alias
  ubicacion?: string; // Backend usa este nombre
  direccion?: string; // Alias
  detalles?: string; // Backend usa este nombre
  descripcion?: string; // Alias
  imagenPerfilUrl?: string;
  imagenBannerUrl?: string; // URL del banner
  logoUrl?: string; // Alias
  bannerUrl?: string; // Alias
  estado?: string; // 'pendiente', 'aprobado', etc.
  fechaCreacion?: string; // Backend usa este nombre
  fechaRegistro?: string; // Alias
}
