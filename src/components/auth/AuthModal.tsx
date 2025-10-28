import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.css';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowRight } from 'react-feather';

export const AuthModal = () => {
  const { browseAsGuest } = useAuth(); // Usamos la nueva función del contexto
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // El modal ya no controla su propia visibilidad, App.tsx lo hace.
  // Por lo tanto, la lógica de animación y cierre se simplifica o elimina.

  const handleClose = () => {
    browseAsGuest(); // Notificamos al contexto que queremos navegar como invitado
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div
      className={styles.authOverlay}
      onMouseDown={handleOverlayClick}
    >
      <div className={styles.authModal}>
        <button onClick={handleClose} className={styles.closeModal} title="Close">
          <X size={24} />
        </button>        
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>
            {activeTab === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <div className={styles.authTabs}>
            <button 
              className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`} 
              onClick={() => setActiveTab('login')}
            >
              Iniciar Sesión
            </button>
            <button 
              className={`${styles.authTab} ${activeTab === 'register' ? styles.active : ''}`} 
              onClick={() => setActiveTab('register')}
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className={`${styles.authForm} ${activeTab === 'login' ? styles.active : ''}`}>
            <LoginForm />
        </div>
        <div className={`${styles.authForm} ${activeTab === 'register' ? styles.active : ''}`}>
            <RegisterForm />
        </div>

        <button onClick={handleClose} className={styles.skipLogin}>
          <ArrowRight size={20} />
          <span>Continuar sin iniciar sesión</span>
        </button>
      </div>
    </div>,
    modalRoot
  );
};
