import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import styles from './Navbar.module.css';
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useUserSettingsModal } from '../../context/UserSettingsModalContext';
import { ProfileDropdown } from './ProfileDropdown'; // Re-importar
import { ShoppingBag, ShoppingCart, Moon, Sun, User } from 'react-feather';

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { itemCount, openCart } = useCart();
  const { flowState, user, negocio, handleLogout, promptLogin } = useAuth();
  const { openModal: openUserSettingsModal } = useUserSettingsModal();

  // Estado para controlar la visibilidad del menú desplegable
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref para el contenedor del menú

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownItemClick = (tab: string) => {
    openUserSettingsModal(tab);
    setDropdownOpen(false); // Cierra el dropdown al abrir el modal
  };

  const handleBusinessClick = () => {
    if (negocio && negocio.estado === 'Activo') {
      navigate('/negocio/inicio');
    } else {
      openUserSettingsModal('registerBusiness');
    }
  };

  console.log('DATOS DE NEGOCIO EN NAVBAR:', negocio);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <ShoppingBag size={24} />
          <span>CompoNet</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/explorar" className={styles.navLink}>Explorar</Link>
          {flowState === 'AUTENTICADO' && (
            user?.roles?.includes('Administrador') ? (
              <button onClick={() => navigate('/panel/admin')} className={styles.navButton}>
                Administración
              </button>
            ) : (
              <button onClick={handleBusinessClick} className={styles.navButton}>
                Business
              </button>
            )
          )}
          
          <button onClick={openCart} className={styles.navCartIcon} title="Ver carrito">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className={`${styles.cartBadge} ${styles.visible}`}>{itemCount}</span>
            )}
          </button>

          <button onClick={toggleTheme} className={styles.themeToggle} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className={styles.authContainer} ref={dropdownRef}>
            {flowState === 'AUTENTICADO' ? (
              <button onClick={() => setDropdownOpen(prev => !prev)} className={styles.authTrigger} title="Ver Perfil">
                <User size={20} />
                <span>Perfil</span>
              </button>
            ) : (
              <button onClick={promptLogin} className={styles.authTrigger} title="Login / Register">
                <User size={20} />
                <span>Login</span>
              </button>
            )}
            {flowState === 'AUTENTICADO' && (
              <ProfileDropdown 
                isOpen={isDropdownOpen} 
                onItemClick={handleDropdownItemClick} 
                onLogout={handleLogout} 
              />
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};