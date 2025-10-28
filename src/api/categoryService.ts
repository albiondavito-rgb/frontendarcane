import { ENDPOINTS } from './endpoints';
import type { Category } from '../types/category';
import type { AdminCategory, CategoryCreateDto, CategoryUpdateDto } from '../types/admin.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

// Mapea los datos de categoría pública (no incluye estaActiva)
const mapPublicCategoryData = (category: any): Category => ({
  id: category.Id || category.id,
  nombre: category.Nombre || category.nombre,
  imagenUrl: category.ImagenUrl || category.imagenUrl,
  descripcion: category.Descripcion || category.descripcion,
});

/**
 * Llama al endpoint para obtener todas las categorías públicas activas.
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await fetch(ENDPOINTS.CATEGORIAS.GET_ALL);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener las categorías');
  }

  const data = await response.json();
  return data.map(mapPublicCategoryData);
};

// Mapea los datos del backend (PascalCase) a camelCase
const mapCategoryData = (category: any): AdminCategory => ({
  id: category.Id || category.id,
  nombre: category.Nombre || category.nombre,
  imagenUrl: category.ImagenUrl || category.imagenUrl,
  estaActiva: category.EstaActiva !== undefined ? category.EstaActiva : category.estaActiva,
});

/**
 * Obtiene todas las categorías para administración
 */
export const getAllAdminCategories = async (): Promise<AdminCategory[]> => {
  const response = await fetch(ENDPOINTS.CATEGORIAS.ADMIN_GET_ALL, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.map(mapCategoryData);
};

/**
 * Crea una nueva categoría
 */
export const createCategory = async (categoryData: CategoryCreateDto): Promise<AdminCategory> => {
  const formData = new FormData();
  formData.append('Nombre', categoryData.nombre);
  formData.append('Imagen', categoryData.imagen);

  const response = await fetch(ENDPOINTS.CATEGORIAS.CREATE, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return mapCategoryData(data);
};

/**
 * Actualiza una categoría existente
 */
export const updateCategory = async (categoryId: number, categoryData: CategoryUpdateDto): Promise<AdminCategory> => {
  const formData = new FormData();
  formData.append('Nombre', categoryData.nombre);
  if (categoryData.imagen) {
    formData.append('Imagen', categoryData.imagen);
  }

  const response = await fetch(ENDPOINTS.CATEGORIAS.UPDATE(categoryId), {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return mapCategoryData(data);
};

/**
 * Elimina (deshabilita) una categoría
 */
export const deleteCategory = async (categoryId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.CATEGORIAS.DELETE(categoryId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    // Solo intentar parsear JSON si hay contenido
    if (response.status !== 204) {
      await handleApiError(response);
    } else {
      throw new Error('Error al deshabilitar categoría');
    }
  }
  // NoContent (204) no tiene body, no intentar parsear JSON
};

/**
 * Activa (reactiva) una categoría deshabilitada
 */
export const activateCategory = async (categoryId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.CATEGORIAS.ACTIVATE(categoryId), {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
  // OK (200) con JSON, pero no necesitamos el body
};
