import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from './components/layout/Navbar';
import { HashScrollManager } from './router/HashScrollManager';
import styles from './App.module.css';
import { AuthModal } from "./components/auth/AuthModal";
import { WelcomeModal } from "./components/layout/WelcomeModal";
import { useAuth } from "./context/AuthContext";

import { useAIChat } from "./context/AIChatContext";
import { AIChatButton } from "./components/ai-chat/AIChatButton";
import { AIChatModal } from "./components/ai-chat/AIChatModal";
import { CartPanel } from "./components/cart/CartPanel";
import { FloatingCartButton } from "./components/cart/FloatingCartButton";
import { useCart } from "./context/CartContext";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { UserSettingsModal } from "./components/layout/UserSettingsModal";
import type { Message } from './types/chat.types';

const AppContent = () => {
  const { flowState, handleGoogleRedirect } = useAuth();
  const { isChatOpen, openChat, closeChat } = useAIChat();
  const { itemCount } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);

  // Efecto para manejar la redirección de Google
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'google') {
      handleGoogleRedirect();
      // Limpia la URL para que el efecto no se repita si el usuario recarga
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleGoogleRedirect]);

  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isCartButtonVisible = isMobile && itemCount > 0;

  return (
    <div className={styles.appContainer}>
      <HashScrollManager />
      <Navbar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Renderizado de Modales controlado por la Máquina de Estados */}
      {flowState === 'BIENVENIDA' && <WelcomeModal message="Bienvenido a CompoNet" />}
      {flowState === 'AUTENTICANDO' && <WelcomeModal message="Iniciando Sesión..." />}
      {flowState === 'CERRANDO_SESION' && <WelcomeModal message="Cerrando sesión..." />}
      {flowState === 'NO_AUTENTICADO' && <AuthModal />}

      {/* Otros componentes flotantes */}
      <AIChatButton onClick={openChat} isShifted={isCartButtonVisible} />
      {isChatOpen && <AIChatModal onClose={closeChat} messages={messages} setMessages={setMessages} />}
      <CartPanel />
      <FloatingCartButton />
      <UserSettingsModal />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;