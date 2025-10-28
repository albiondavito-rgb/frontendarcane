import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import styles from './BusinessLayout.module.css';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'react-feather';

export const BusinessLayout = () => {
    const { negocio } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const businessName = negocio?.nombre || "Mi Negocio";

    return (
        <div className={styles.businessLayout}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            {isSidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <header className={styles.header}>
                        <button className={styles.menuButton} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <Menu size={24} />
                        </button>
                        <h1 className={styles.businessTitle}>
                            {businessName}
                        </h1>
                    </header>
                    {/* Aquí se renderizarán las páginas anidadadas (Inicio, Productos, etc.) */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
