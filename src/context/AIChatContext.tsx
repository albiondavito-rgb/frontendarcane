import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

// 1. Definimos la "forma" del contexto del chat
type AIChatContextType = {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
};

// 2. Creamos el Contexto
const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

// 3. Creamos el componente Proveedor
type AIChatProviderProps = {
  children: ReactNode;
};

export const AIChatProvider = ({ children }: AIChatProviderProps) => {
  // El estado que controla si la ventana del chat está abierta
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  const value = { isChatOpen, openChat, closeChat };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
};

// 4. Creamos el hook personalizado para un uso fácil y seguro
export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat debe ser usado dentro de un AIChatProvider');
  }
  return context;
};
