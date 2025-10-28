import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import {
    Layout, 
    ShoppingCart, 
    Package, 
    DollarSign, 
    Star, 
    Users, 
    Settings
} from 'react-feather';

const navItems = [
    { to: '/negocio/inicio', icon: Layout, label: 'Inicio' },
    { to: '/negocio/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/negocio/productos', icon: Package, label: 'Productos' },
    { to: '/negocio/ventas', icon: DollarSign, label: 'Ventas' },
    { to: '/negocio/resenas', icon: Star, label: 'Reseñas' },
    { to: '/negocio/trabajadores', icon: Users, label: 'Trabajadores' },
    { to: '/negocio/configuracion', icon: Settings, label: 'Configuración' },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    return (
        <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <ul className={styles.navList}>
                {navItems.map((item) => (
                    <li key={item.to} className={styles.navItem}>
                        <NavLink 
                            to={item.to} 
                            end={item.to === '/negocio/inicio'} // `end` para que no coincida con otras rutas
                            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                            onClick={onClose}
                        >
                            <item.icon className={styles.navIcon} />
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};
