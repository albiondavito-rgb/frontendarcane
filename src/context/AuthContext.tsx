import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { register as registerService, login as loginService, getMe, logout as logoutService } from '../api/authService';
import { getMyBusiness } from '../api/businessService';
import type { RegisterPayload, LoginPayload, User } from '../types/auth.types';
import type { Negocio } from '../types/negocio';

// 1. DEFINIMOS LOS ESTADOS DEL FLUJO DE AUTENTICACIÓN
type AuthFlowState = 'BIENVENIDA' | 'AUTENTICANDO' | 'NO_AUTENTICADO' | 'AUTENTICADO' | 'NAVEGANDO_COMO_INVITADO' | 'CERRANDO_SESION';

interface AuthState {
  user: User | null;
  negocio: Negocio | null;
  flowState: AuthFlowState;
}

interface AuthContextType extends AuthState {
  handleRegister: (payload: RegisterPayload) => Promise<any>;
  handleLogin: (payload: LoginPayload) => Promise<void>;
  handleLogout: () => Promise<void>;
  browseAsGuest: () => void;
  promptLogin: () => void;
  handleGoogleRedirect: () => void;
  refreshUserData: () => Promise<void>;
  updateLocalUser: (updatedFields: Partial<User>) => void; // <- Función para actualizar localmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  negocio: null,
  flowState: 'BIENVENIDA',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Función para verificar la sesión del usuario, ahora reutilizable
  const refreshUserData = useCallback(async () => {
    try {
      const user = await getMe();
      console.log('DATOS COMPLETOS DE GETME:', user);
      if (user) {
        // Obtener negocio siempre que haya usuario para mantener estado sincronizado
        try {
          const negocioData = await getMyBusiness();
          setState(prevState => ({ ...prevState, user, negocio: negocioData || null, flowState: 'AUTENTICADO' }));
        } catch (e) {
          console.error('Error al obtener negocio en refreshUserData:', e);
          setState(prevState => ({ ...prevState, user, negocio: null, flowState: 'AUTENTICADO' }));
        }
      } else {
        // Si no hay usuario, vamos a NO_AUTENTICADO para mostrar el login
        setState(prevState => ({ ...prevState, user: null, negocio: null, flowState: 'NO_AUTENTICADO' }));
      }
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      setState(prevState => ({ ...prevState, user: null, negocio: null, flowState: 'NO_AUTENTICADO' }));
    }
  }, []);

  // Efecto para verificar la sesión inicial del usuario
  useEffect(() => {
    if (state.flowState === 'BIENVENIDA') {
      const timer = setTimeout(() => {
        refreshUserData(); // Usamos la nueva función
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.flowState, refreshUserData]);

  // Mantener negocio sincronizado siempre que haya usuario activo
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (state.user) {
        try {
          const negocioData = await getMyBusiness();
          setState(prevState => ({ ...prevState, negocio: negocioData || null }));
        } catch (error) {
          console.error("Error al obtener los datos del negocio:", error);
          setState(prevState => ({ ...prevState, negocio: null }));
        }
      } else if (!state.user && state.negocio) {
        setState(prevState => ({ ...prevState, negocio: null }));
      }
    };

    fetchBusinessData();
  }, [state.user]);


  const handleLogin = useCallback(async (payload: LoginPayload) => {
    try {
      // 1. Hacemos login y solo guardamos los datos del usuario
      const userData = await loginService(payload);
      console.log('DATOS COMPLETOS DEL LOGIN:', userData);
      // El useEffect se encargará de buscar el negocio.
      setState({ user: userData, negocio: null, flowState: 'AUTENTICADO' });
    } catch (error) {
      console.error("Error en el login:", error);
      throw error;
    }
  }, []);

  const handleGoogleRedirect = useCallback(async () => {
    setState(prevState => ({ ...prevState, flowState: 'AUTENTICANDO' }));
    await refreshUserData();
    // El estado se actualizará a AUTENTICADO o NO_AUTENTICADO dentro de refreshUserData
  }, [refreshUserData]);

  const handleRegister = async (payload: RegisterPayload) => {
    return await registerService(payload);
  };

  const handleLogout = async () => {
    setState(prevState => ({ ...prevState, flowState: 'CERRANDO_SESION' }));
    try {
      await logoutService();
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
    } finally {
      setTimeout(() => {
        // Limpiamos todo el estado
        setState({ user: null, negocio: null, flowState: 'NAVEGANDO_COMO_INVITADO' });
      }, 1000);
    }
  };

  const browseAsGuest = () => {
    setState(prevState => ({ ...prevState, flowState: 'NAVEGANDO_COMO_INVITADO' }));
  };

  const promptLogin = () => {
    setState(prevState => ({ ...prevState, flowState: 'NO_AUTENTICADO' }));
  };

  // Función para actualizar el usuario localmente
  const updateLocalUser = (updatedFields: Partial<User>) => {
    if (state.user) {
      setState(prevState => ({
        ...prevState,
        user: { ...prevState.user!, ...updatedFields },
      }));
    }
  };

  const value = {
    ...state,
    handleRegister,
    handleLogin,
    handleLogout,
    browseAsGuest,
    promptLogin,
    handleGoogleRedirect,
    refreshUserData,
    updateLocalUser, // <- Exponer la nueva función
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};