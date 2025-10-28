import { useAuth } from '../../context/AuthContext';
import styles from './BusinessHomePage.module.css';
import { Loader } from 'react-feather';
import { useState, useEffect } from 'react';
// Se elimina getGananciasStats
import { getPedidosStats, getProductosStats, getCarritosStats } from '../../api/dashboardService';
import type {
  DashboardPedidosStats,
  DashboardProductosStats,
  // Se elimina DashboardGananciasStats
  DashboardCarritosStats
} from '../../types/dashboard.types';

// Se importan solo los 3 gráficos restantes
import { PedidosChart } from '../../components/dashboard/PedidosChart';
import { ProductosChart } from '../../components/dashboard/ProductosChart';
import { CarritosChart } from '../../components/dashboard/CarritosChart';

export const BusinessHomePage = () => {
    const { negocio } = useAuth();
    const [showNotice, setShowNotice] = useState(true);
    const [pedidosStats, setPedidosStats] = useState<DashboardPedidosStats | null>(null);
    const [productosStats, setProductosStats] = useState<DashboardProductosStats | null>(null);
    // Se elimina el estado de gananciasStats
    const [carritosStats, setCarritosStats] = useState<DashboardCarritosStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const loadDashboardStats = async () => {
            if (!negocio) return;
            const businessId = negocio.negocioId || negocio.id;
            if (!businessId) return;
            
            try {
                setLoadingStats(true);
                // Se elimina getGananciasStats de la llamada en paralelo
                const [pedidos, productos, carritos] = await Promise.all([
                    getPedidosStats(businessId),
                    getProductosStats(businessId),
                    getCarritosStats(businessId)
                ]);
                setPedidosStats(pedidos);
                setProductosStats(productos);
                // Se elimina la actualización de estado de ganancias
                setCarritosStats(carritos);
            } catch (error) {
                console.error('Error al cargar estadísticas del dashboard:', error);
            } finally {
                setLoadingStats(false);
            }
        };

        loadDashboardStats();
    }, [negocio]);

    if (!negocio) {
        return <div>Cargando información del negocio...</div>;
    }

    const isApproved = negocio.estado?.toLowerCase() === 'activo';

    if (!isApproved) {
        return (
            <div className={styles.homeContainer}>
                {showNotice && (
                    <div className={styles.noticeOverlay}>
                        <div className={styles.noticeModal}>
                            <div className={styles.noticeTitle}>Tu solicitud está en proceso</div>
                            <div className={styles.noticeText}>Estado actual: {negocio.estado}. Te avisaremos cuando sea aprobada.</div>
                            <button className={styles.primaryBtn} onClick={() => setShowNotice(false)}>Entendido</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={styles.homeContainer}>
            <h2 className={styles.welcomeTitle}>Dashboard de Rendimiento</h2>
            
            {loadingStats ? (
                <div className={styles.loadingContainer}>
                    <Loader size={32} className={styles.spinner} />
                    <p>Cargando estadísticas...</p>
                </div>
            ) : (
                <div className={styles.chartsGrid}>
                    {productosStats && (
                        <div className={styles.chartSpanTwo}>
                            <ProductosChart data={productosStats} />
                        </div>
                    )}
                    
                    {pedidosStats && <PedidosChart data={pedidosStats} />}
                    {/* Se elimina el gráfico de ganancias */}
                    {carritosStats && <CarritosChart data={carritosStats} />}
                </div>
            )}
        </div>
    );
};
