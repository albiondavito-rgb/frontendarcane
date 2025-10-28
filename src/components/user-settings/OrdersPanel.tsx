import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Panels.module.css';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';
import { getPedidosPorUsuario } from '../../api/pedidoService';
import type { PedidoHistorialDto } from '../../types/pedido.types';

const getStatusClass = (estado: string) => {
    const s = estado.toLowerCase();
    if (s === 'recibido' || s === 'entregado') return { background: 'var(--success-light)', color: 'var(--success-color)' };
    if (s === 'cancelado' || s === 'rechazado') return { background: 'var(--warning-light)', color: 'var(--error-dark)' };
    if (s === 'enviado') return { background: 'var(--accent-light)', color: 'var(--accent-color)' };
    return { background: 'var(--bg-color)', color: 'var(--text-muted)' };
}

export const OrdersPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PedidoHistorialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const data = await getPedidosPorUsuario(user.id);
          setOrders(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar los pedidos');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return <div className={styles.centeredMessage}>Cargando pedidos...</div>;
  }

  if (error) {
    return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;
  }

  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.settingsSectionTitle}>Mis Pedidos</h3>
      
      <div className={styles.orderList}>
        {orders.length === 0 ? (
          <div className={styles.centeredMessage}>No tienes pedidos aún.</div>
        ) : (
          orders.map(order => (
            <div key={order.pedidoId} className={styles.orderListItem}>
              <div className={styles.orderListItemHeader}>
                <span className={styles.orderId}>Pedido #{order.numeroPedido}</span>
                <span className={styles.orderStatus} style={getStatusClass(order.estadoGeneral)}>
                  {order.estadoGeneral}
                </span>
              </div>
              <div className={styles.orderListItemBody}>
                <div className={styles.orderListDetails}>
                  <span><strong>Fecha:</strong> {new Date(order.fechaPedido).toLocaleDateString('es-ES')}</span>
                  <span><strong>Total:</strong> {formatCurrency(order.montoTotal)}</span>
                </div>
                <div className={styles.orderListActions}>
                  <button 
                    className={styles.btn} 
                    onClick={() => navigate(`/pedido/${order.pedidoId}`)}
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};