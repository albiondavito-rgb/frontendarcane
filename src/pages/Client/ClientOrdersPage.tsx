import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClientOrdersPage.module.css';
import { Package, Calendar, DollarSign, Eye } from 'react-feather';
import { useAuth } from '../../context/AuthContext';
import { getPedidosPorUsuario } from '../../api/pedidoService';
import type { PedidoHistorialDto } from '../../types/pedido.types';

export const ClientOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoHistorialDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

  useEffect(() => {
    if (user?.id) {
      loadPedidos();
    }
  }, [user]);

  const loadPedidos = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getPedidosPorUsuario(user.id);
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = filtroEstado === 'Todos'
    ? pedidos
    : pedidos.filter(p => p.estadoGeneral === filtroEstado);

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Confirmado': return 'info';
      case 'Enviado': return 'primary';
      case 'Recibido': return 'success';
      case 'Cancelado': return 'error';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <div className={styles.emptyState}>
        <p>Debes iniciar sesión para ver tus pedidos</p>
        <button onClick={() => navigate('/login')} className={styles.btnPrimary}>
          Iniciar Sesión
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mis Pedidos</h1>
          <p className={styles.subtitle}>
            Tienes {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros */}
        <div className={styles.filters}>
          {['Todos', 'Pendiente', 'Confirmado', 'Enviado', 'Recibido', 'Cancelado'].map((estado) => (
            <button
              key={estado}
              className={`${styles.filterBtn} ${filtroEstado === estado ? styles.active : ''}`}
              onClick={() => setFiltroEstado(estado)}
            >
              {estado}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} className={styles.emptyIcon} />
            <h3>No hay pedidos</h3>
            <p>
              {filtroEstado === 'Todos'
                ? 'Aún no has realizado ningún pedido'
                : `No tienes pedidos con estado "${filtroEstado}"`}
            </p>
            <button onClick={() => navigate('/explorar')} className={styles.btnPrimary}>
              Explorar Productos
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.pedidoId} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderNumber}>
                    Pedido #{pedido.numeroPedido}
                  </div>
                  <span className={`${styles.statusBadge} ${styles[getEstadoColor(pedido.estadoGeneral)]}`}>
                    {pedido.estadoGeneral}
                  </span>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.detailItem}>
                    <Calendar size={18} />
                    <span>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Package size={18} />
                    <span>{pedido.cantidadNegocios} negocio{pedido.cantidadNegocios > 1 ? 's' : ''}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <DollarSign size={18} />
                    <span>${pedido.montoTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.orderStats}>
                  <span className={styles.statBadge}>
                    {pedido.cantidadItems} producto{pedido.cantidadItems > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/pedido/${pedido.pedidoId}`)}
                  className={styles.btnView}
                >
                  <Eye size={18} />
                  Ver Detalle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
