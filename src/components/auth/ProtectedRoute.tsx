import type { ReactElement } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRoles?: string[];
  requiresBusiness?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles, requiresBusiness }) => {
  const { flowState, user, negocio } = useAuth();
  const location = useLocation();

  // 1. Si el usuario no está autenticado, redirigir a la página de inicio.
  // El hook `useAuth` en la página de inicio se encargará de mostrar el modal de login.
  if (flowState !== 'AUTENTICADO') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Si se requieren roles específicos, verificar que el usuario los tenga.
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some(role => requiredRoles.includes(role));
    if (!hasRequiredRole) {
      // El usuario está logueado pero no tiene el rol. Redirigir a inicio.
      return <Navigate to="/" replace />;
    }
  }

  // 3. Si se requiere un negocio, verificar que exista y esté activo.
  if (requiresBusiness) {
    if (!negocio || negocio.estado !== 'Activo') {
      // El usuario está logueado pero no tiene un negocio activo. Redirigir a inicio.
      return <Navigate to="/" replace />;
    }
  }

  // Si todas las validaciones pasan, renderizar el componente hijo (la página protegida).
  return children;
};
