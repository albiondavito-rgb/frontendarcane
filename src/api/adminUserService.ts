import { ENDPOINTS } from './endpoints';
import type { AdminUser, AdminUserCreateDto, AdminUserUpdateDto } from '../types/admin.types';
import type { FoundUser } from '../types/user.types';

const handleApiError = async (response: Response) => {
  const errorData = await response.json();
  throw new Error(errorData.message || 'Error en la operación');
};

/**
 * Obtiene todos los usuarios para administración
 */
export const getAllUsers = async (buscar?: string): Promise<AdminUser[]> => {
  const url = buscar 
    ? `${ENDPOINTS.ADMIN.USUARIOS.GET_ALL}?buscar=${encodeURIComponent(buscar)}`
    : ENDPOINTS.ADMIN.USUARIOS.GET_ALL;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Crea un nuevo usuario
 */
export const createUser = async (userData: AdminUserCreateDto): Promise<AdminUser> => {
  const response = await fetch(ENDPOINTS.ADMIN.USUARIOS.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Actualiza un usuario existente
 */
export const updateUser = async (userId: number, userData: AdminUserUpdateDto): Promise<AdminUser> => {
  const response = await fetch(ENDPOINTS.ADMIN.USUARIOS.UPDATE(userId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

/**
 * Elimina un usuario
 */
export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(ENDPOINTS.ADMIN.USUARIOS.DELETE(userId), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    await handleApiError(response);
  }
};

/**
 * Busca un usuario por su email para agregarlo como trabajador.
 * @param email El email del usuario a buscar.
 * @returns Los datos del usuario si se encuentra, o null si no se encuentra.
 */
export const findUserByEmail = async (email: string): Promise<FoundUser | null> => {
  try {
    const response = await fetch(ENDPOINTS.USUARIOS.FIND_BY_EMAIL(email), {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 404) {
      return null;
    }
    
    // Para otros errores, usar el manejador existente y devolver null
    await handleApiError(response);
    return null;
  } catch (error) {
    // Capturar errores de red o del manejador y devolver null
    console.error(`Error en la búsqueda de usuario por email (${email}):`, error);
    return null;
  }
};


