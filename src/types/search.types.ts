export type SearchResultType = 'Producto' | 'Negocio' | 'Categoria';

export interface GlobalSearchResult {
  id: number;
  nombre: string;
  tipo: SearchResultType;
  imagenUrl?: string;
  contexto?: string;
}
