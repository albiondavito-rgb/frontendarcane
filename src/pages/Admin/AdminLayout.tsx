import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './components/AdminSidebar';
import styles from '../Business/BusinessLayout.module.css';
import { Menu } from 'react-feather';

export const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles.businessLayout}>
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            {isSidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <header className={styles.header}>
                        <button className={styles.menuButton} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            <Menu size={24} />
                        </button>
                        <h1 className={styles.businessTitle}>
                            Panel de Administración
                        </h1>
                    </header>
                    {/* Aquí se renderizarán las páginas de gestión del admin */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
