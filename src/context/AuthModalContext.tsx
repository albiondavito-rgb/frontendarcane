import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// 1. Definimos la "forma" que tendrá nuestro contexto: un estado booleano y dos funciones.
type AuthModalContextType = {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

// 2. Creamos el Contexto. Lo usaremos para crear el Proveedor y el hook.
const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

// 3. Creamos el componente Proveedor.
// Este componente envolverá nuestra aplicación y le dará acceso al contexto.
type AuthModalProviderProps = {
  children: ReactNode;
};

export const AuthModalProvider = ({ children }: AuthModalProviderProps) => {
  // Aquí vive el estado. Por defecto, el modal está cerrado.
  const [isModalOpen, setIsModalOpen] = useState(true); // Temporalmente abierto por defecto para revisión

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // El "valor" que nuestros componentes podrán consumir.
  const value = { isModalOpen, openModal, closeModal };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

// 4. Creamos un "hook" personalizado para consumir el contexto de forma sencilla y segura.
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    // Si intentamos usar este hook fuera del proveedor, lanzamos un error claro.
    throw new Error('useAuthModal debe ser usado dentro de un AuthModalProvider');
  }
  return context;
};
