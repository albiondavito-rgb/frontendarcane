import styles from './ProfileDropdown.module.css';
import { User, Shield, CreditCard, Briefcase, ShoppingBag, Clock, LogOut } from 'react-feather';

interface ProfileDropdownProps {
  isOpen: boolean;
  onItemClick: (tab: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { tab: 'profile', icon: <User size={18} />, text: 'Cuenta' },
  { tab: 'security', icon: <Shield size={18} />, text: 'Seguridad' },
  { tab: 'payment', icon: <CreditCard size={18} />, text: 'Formas de Pago' },
  { tab: 'registerBusiness', icon: <Briefcase size={18} />, text: 'Registrar mi Negocio' },
  { tab: 'orders', icon: <ShoppingBag size={18} />, text: 'Pedidos' },
  { tab: 'history', icon: <Clock size={18} />, text: 'Historial de Compras' },
];

export const ProfileDropdown = ({ isOpen, onItemClick, onLogout }: ProfileDropdownProps) => {
  return (
    <div className={`${styles.dropdownMenu} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li key={item.tab}>
            <button className={styles.menuItem} onClick={() => onItemClick(item.tab)}>
              {item.icon}
              <span>{item.text}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.separator}></div>
      <div className={styles.logoutWrapper}>
        <button onClick={onLogout} className={`${styles.menuItem} ${styles.logoutButton}`}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
