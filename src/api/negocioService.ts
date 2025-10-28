import { ENDPOINTS } from './endpoints';
import type { RegisterNegocioDto, Negocio } from '../types/negocio';

/**
 * Llama al endpoint para registrar un nuevo negocio.
 */
export const registerNegocio = async (
  negocioData: RegisterNegocioDto, 
  imagen: File, 
  usuarioId: number
) => {
  
  const formData = new FormData();
  formData.append('Nombre', negocioData.nombre);
  formData.append('Detalles', negocioData.descripcion);
  formData.append('Ubicacion', negocioData.direccion);
  formData.append('TelefonoNegocio', negocioData.telefono);
  formData.append('ImagenPerfil', imagen);

  const response = await fetch(ENDPOINTS.NEGOCIOS.REGISTER(usuarioId), {
    method: 'POST',
    headers: {
      // NO agregamos 'Content-Type': el navegador lo hará por nosotros con el boundary correcto para FormData
    },
    body: formData,
    credentials: 'include', // ¡Importante! Envía la cookie de sesión.
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Si la respuesta no es OK, lanzamos el objeto de error que viene del backend
    throw responseData;
  }

  return responseData;
};

/**
 * Llama al endpoint para obtener el negocio del usuario autenticado.
 */

export const getMyBusiness = async (): Promise<Negocio | null> => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.GET_MY_NEGOCIO, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ¡Importante! Envía la cookie de sesión.
  });

  if (response.status === 404) {
    // Si es 404, es un caso esperado: el usuario no tiene negocio.
    // Devolvemos null para que el AuthContext pueda manejarlo.
    return null;
  }

  if (!response.ok) {
    // Para otros errores (500, 401, etc.), lanzamos un error.
    throw new Error('Error al obtener los datos del negocio.');
  }

  const responseData = await response.json();
  return responseData;
};

/**
 * Llama al endpoint para que el usuario autenticado elimine su negocio rechazado.
 */
export const eliminarMiNegocio = async () => {
  const response = await fetch(ENDPOINTS.NEGOCIOS.DELETE_MY_NEGOCIO, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ¡Importante! Envía la cookie de sesión.
  });

  if (!response.ok) {
    // Si la respuesta no es OK (ej. 400 Bad Request si el negocio no está rechazado),
    // lanzamos un error para que el frontend pueda manejarlo.
    const errorData = await response.json().catch(() => ({ message: 'Error al eliminar el negocio.' }));
    throw errorData;
  }

  // Para una respuesta 204 No Content, no hay cuerpo que parsear, así que solo retornamos.
  return;
};