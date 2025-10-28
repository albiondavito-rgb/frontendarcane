// Backend devuelve PascalCase, necesitamos mapear a camelCase
export type Product = {
  id: number;
  negocioId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidadStock: number;
  imagenUrl: string;
  estaActivo: boolean;
  // Campos opcionales que pueden venir del backend
  nombreNegocio?: string;
  nombreCategoria?: string;
  negocio?: any;
  categoria?: {
    id: number;
    nombre: string;
    imagenUrl: string;
    estaActiva: boolean;
  };
  // Aliases para compatibilidad con diferentes partes del código
  stock?: number;
  categoriaNombre?: string;
  // Campos opcionales para UI
  rating?: number;
  reviewCount?: number;
};
