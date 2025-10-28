import { ENDPOINTS } from './endpoints';
import type { Product } from '../types/product';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

// Mapea los datos del backend (PascalCase) a camelCase con aliases
const mapProductData = (product: any): Product => ({
  id: product.Id || product.id,
  negocioId: product.NegocioId || product.negocioId,
  nombreNegocio: product.NombreNegocio || product.nombreNegocio,
  categoriaId: product.CategoriaId || product.categoriaId,
  nombreCategoria: product.NombreCategoria || product.nombreCategoria,
  nombre: product.Nombre || product.nombre,
  descripcion: product.Descripcion || product.descripcion,
  precio: product.Precio || product.precio,
  cantidadStock: product.CantidadStock || product.cantidadStock,
  imagenUrl: product.ImagenUrl || product.imagenUrl,
  estaActivo: product.EstaActivo !== undefined ? product.EstaActivo : product.estaActivo,
  stock: product.CantidadStock || product.cantidadStock || product.stock,
  categoriaNombre: product.NombreCategoria || product.nombreCategoria,
  rating: product.Rating || product.rating || 0, // Añadir rating
  reviewCount: product.ReviewCount || product.reviewCount || 0, // Añadir reviewCount
});

/**
 * Obtiene todos los productos
 */
export const getAllProducts = async (): Promise<Product[]> => {
  const response = await fetch(ENDPOINTS.PRODUCTOS.GET_ALL);

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.map(mapProductData);
};

/**
 * Obtiene TODOS los productos por negocio (incluyendo inactivos) - Para panel de negocio
 */
export const getProductosPorNegocio = async (negocioId: number): Promise<Product[]> => {
  const response = await fetch(ENDPOINTS.PRODUCTOS.GET_BY_NEGOCIO(negocioId), {
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.map(mapProductData);
};

/**
 * Crea un nuevo producto
 */
export const createProducto = async (formData: FormData): Promise<Product> => {
  const response = await fetch(ENDPOINTS.PRODUCTOS.CREATE, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return mapProductData(data);
};

/**
 * Actualiza un producto existente
 */
export const updateProducto = async (id: number, formData: FormData): Promise<void> => {
  const response = await fetch(ENDPOINTS.PRODUCTOS.UPDATE(id), {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Elimina un producto (soft delete)
 */
export const deleteProducto = async (id: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.PRODUCTOS.DELETE(id), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Reactiva un producto inactivo
 */
export const activateProducto = async (id: number): Promise<void> => {
  const response = await fetch(`${ENDPOINTS.PRODUCTOS.DELETE(id)}/activar`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};
