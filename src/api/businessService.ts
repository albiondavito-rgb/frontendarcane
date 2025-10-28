import { ENDPOINTS } from './endpoints';
import type { Business, Negocio } from '../types/negocio';

// Mapea los datos del backend a Negocio
// IMPORTANTE: Backend envía camelCase por defecto (.NET 6+)
const mapNegocioData = (negocio: any): Negocio => ({
    id: negocio.id || negocio.Id,
    negocioId: negocio.id || negocio.Id || negocio.negocioId,
    usuarioId: negocio.usuarioId || negocio.UsuarioId,
    nombre: negocio.nombre || negocio.Nombre,
    // ✅ CORREGIDO: Buscar camelCase primero
    telefonoNegocio: negocio.telefonoNegocio || negocio.TelefonoNegocio,
    telefono: negocio.telefonoNegocio || negocio.TelefonoNegocio || negocio.telefono,
    ubicacion: negocio.ubicacion || negocio.Ubicacion,
    direccion: negocio.ubicacion || negocio.Ubicacion || negocio.direccion,
    detalles: negocio.detalles || negocio.Detalles,
    descripcion: negocio.detalles || negocio.Detalles || negocio.descripcion,
    imagenPerfilUrl: negocio.imagenPerfilUrl || negocio.ImagenPerfilUrl,
    imagenBannerUrl: negocio.imagenBannerUrl || negocio.ImagenBannerUrl,
    logoUrl: negocio.imagenPerfilUrl || negocio.ImagenPerfilUrl || negocio.logoUrl,
    bannerUrl: negocio.imagenBannerUrl || negocio.ImagenBannerUrl || negocio.bannerUrl,
    estado: negocio.estado || negocio.Estado,
    fechaCreacion: negocio.fechaCreacion || negocio.FechaCreacion,
    fechaRegistro: negocio.fechaCreacion || negocio.FechaCreacion || negocio.fechaRegistro,
});

/**
 * Llama al endpoint para obtener el negocio del usuario autenticado.
 * Requiere que el usuario esté logueado (envía la cookie de sesión).
 */
export const getMyBusiness = async (): Promise<Negocio | null> => {
    const response = await fetch(ENDPOINTS.NEGOCIOS.GET_MY_NEGOCIO, {
        credentials: 'include', // ¡Importante! Envía la cookie de sesión.
    });

    if (!response.ok) {
        // Si el estado es 404 (No Encontrado) o 401 (No Autorizado), no es un error fatal.
        // Simplemente significa que el usuario no tiene un negocio o no está autenticado.
        if (response.status === 404 || response.status === 401) {
            return null;
        }
        // Para otros errores (ej. 500), sí intentamos leer el cuerpo del error.
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener el negocio del usuario');
    }

    const data = await response.json();
    return mapNegocioData(data);
};

// Mapea los datos de Business del backend
// IMPORTANTE: Backend envía camelCase por defecto (.NET 6+)
const mapBusinessData = (business: any): Business => {
  return {
    id: business.id || business.Id,
    nombre: business.nombre || business.Nombre,
    // ✅ CORREGIDO: Buscar camelCase primero (backend envía camelCase)
    descripcion: business.detalles || business.Detalles || business.descripcion || business.Descripcion,
    direccion: business.ubicacion || business.Ubicacion || business.direccion || business.Direccion,
    telefono: business.telefonoNegocio || business.TelefonoNegocio || business.telefono || business.Telefono,
    email: business.email || business.Email,
    imagenUrl: business.imagenUrl || business.ImagenUrl,
    imagenPerfilUrl: business.imagenPerfilUrl || business.ImagenPerfilUrl,
    imagenBannerUrl: business.imagenBannerUrl || business.ImagenBannerUrl,
    estado: business.estado || business.Estado,
    fechaRegistro: business.fechaCreacion || business.FechaCreacion || business.fechaRegistro || business.FechaRegistro,
  };
};

/**
 * Llama al endpoint para obtener todos los negocios.
 */
export const getAllBusinesses = async (): Promise<Business[]> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.GET_ALL);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al obtener los negocios');
  }

  const data = await response.json();
  return data.map(mapBusinessData);
};

/**
 * Actualiza los datos de un negocio
 */
export const updateNegocio = async (negocioId: number, formData: FormData): Promise<Negocio> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.UPDATE(negocioId), {
    method: 'PUT',
    credentials: 'include',
    body: formData, // FormData se envía directamente sin Content-Type header
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el negocio');
  }

  const data = await response.json();
  return mapNegocioData(data);
};
