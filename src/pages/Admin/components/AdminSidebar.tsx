import { NavLink } from 'react-router-dom';
import styles from '../../../components/layout/Sidebar.module.css';
import {
    AlertTriangle,
    Grid,
    Users,
    Briefcase,
    DollarSign
} from 'react-feather';

const navItems = [
    { to: '/panel/admin/pending-businesses', icon: AlertTriangle, label: 'Negocios pendientes' },
    { to: '/panel/admin/categories-manager', icon: Grid, label: 'Gestor de categorías' },
    { to: '/panel/admin/users-manager', icon: Users, label: 'Gestor de usuarios' },
    { to: '/panel/admin/businesses-manager', icon: Briefcase, label: 'Gestor de negocios' },
    { to: '/panel/admin/transactions-history', icon: DollarSign, label: 'Historial de transacciones' },
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
    return (
        <nav className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <ul className={styles.navList}>
                {navItems.map((item) => (
                    <li key={item.to} className={styles.navItem}>
                        <NavLink 
                            to={item.to} 
                            end={item.to === '/panel/admin'} 
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
