import { useState, useEffect } from 'react';
import styles from './HistoryPanel.module.css';
import { OrderDetailModal } from './OrderDetailModal';
import { useAuth } from '../../context/AuthContext';
import { getPedidosPorUsuario, getPedidoHistorialDetalle } from '../../api/pedidoService';
import type { PedidoHistorialDto, PedidoHistorialDetalleDto } from '../../types/pedido.types';
import { formatCurrency } from '../../utils/currency';

export const HistoryPanel = () => {
  const { user } = useAuth();

  const [pedidos, setPedidos] = useState<PedidoHistorialDto[]>([]);
  const [detalles, setDetalles] = useState<Record<number, PedidoHistorialDetalleDto>>({});
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<PedidoHistorialDetalleDto | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchPedidos = async () => {
        try {
          setLoadingList(true);
          const data = await getPedidosPorUsuario(user.id);
          setPedidos(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al cargar el historial');
        } finally {
          setLoadingList(false);
        }
      };
      fetchPedidos();
    }
  }, [user]);

  const handleToggleExpand = async (pedidoId: number) => {
    const isAlreadyExpanded = expandedOrderId === pedidoId;
    if (isAlreadyExpanded) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(pedidoId);

    if (!detalles[pedidoId] && user?.id) {
      try {
        setLoadingDetails(pedidoId);
        const detalleData = await getPedidoHistorialDetalle(user.id, pedidoId);
        setDetalles(prev => ({ ...prev, [pedidoId]: detalleData }));
      } catch (err) {
        setError(err instanceof Error ? err.message : `Error al cargar detalle del pedido #${pedidoId}`);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  const handleOpenModal = (pedidoDetalle: PedidoHistorialDetalleDto) => {
    setSelectedOrderForModal(pedidoDetalle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderForModal(null);
  };

  const handleReviewSuccess = () => {
    handleCloseModal();
    if (selectedOrderForModal && user?.id) {
      handleToggleExpand(selectedOrderForModal.pedidoId); // Esto recargará los detalles
    }
  };

  if (loadingList) {
    return <div className={styles.centeredMessage}>Cargando historial...</div>;
  }

  if (error) {
    return <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>{error}</div>;
  }

  return (
    <div className={styles.settingsSection}>
      <h3 className={styles.settingsSectionTitle}>Historial de Compras</h3>
      
      <div className={styles.tableContainer}>
        {pedidos.length === 0 ? (
          <div className={styles.centeredMessage}>No tienes compras en tu historial.</div>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>ID del Pedido</th>
                <th>Fecha</th>
                <th className={styles.iconColumn}></th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => {
                const isExpanded = expandedOrderId === pedido.pedidoId;
                const detalleActual = detalles[pedido.pedidoId];

                return (
                  <>
                    <tr 
                      key={pedido.pedidoId} 
                      className={styles.historyRow} 
                      onClick={() => handleToggleExpand(pedido.pedidoId)}
                    >
                      <td>#{pedido.pedidoId}</td>
                      <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES')}</td>
                      <td>
                        <span className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={3}>
                          {loadingDetails === pedido.pedidoId ? (
                            <div className={styles.centeredMessage}>Cargando detalles...</div>
                          ) : detalleActual ? (
                            <div className={styles.expandedCard}>
                              <div className={styles.cardGrid}>
                                <div className={styles.cardItem}>
                                  <strong>Cliente:</strong>
                                  {/* Asumimos que el nombre del usuario está disponible en el contexto o se podría añadir al DTO */}
                                  <span>{detalleActual.nombreCompletoCliente}</span>
                                </div>
                                <div className={styles.cardItem}>
                                  <strong>Productos:</strong>
                                  <span>{detalleActual.cantidadTotalProductos}</span>
                                </div>
                                <div className={styles.cardItem}>
                                  <strong>Total Pagado:</strong>
                                  <span>{formatCurrency(detalleActual.totalPagado)}</span>
                                </div>
                                <div className={styles.cardItem}>
                                  <strong>Método de Pago:</strong>
                                  <span>{detalleActual.metodoPago}</span>
                                </div>
                              </div>
                              <button 
                                className={styles.detailsButton}
                                onClick={() => handleOpenModal(detalleActual)}
                              >
                                Ver Detalles
                              </button>
                            </div>
                          ) : (
                            <div className={`${styles.centeredMessage} ${styles.errorMessage}`}>No se pudieron cargar los detalles.</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedOrderForModal && (
        <OrderDetailModal order={selectedOrderForModal} onClose={handleCloseModal} onReviewSuccess={handleReviewSuccess} />
      )}
    </div>
  );
};
