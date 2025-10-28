import { ENDPOINTS } from './endpoints';
import type { GlobalSearchResult } from '../types/search.types';

export const globalSearch = async (query: string): Promise<GlobalSearchResult[]> => {
  if (!query.trim()) {
    return [];
  }

  const url = new URL(ENDPOINTS.PUBLICO.GLOBAL_SEARCH);
  url.searchParams.append('q', query);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`Error fetching search results: ${response.statusText}`);
      return []; // Devuelve un array vacío en caso de error para no romper el frontend.
    }

    const data: GlobalSearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('An unexpected error occurred during the search API call:', error);
    return []; // Devuelve un array vacío en caso de error de red u otros.
  }
};
