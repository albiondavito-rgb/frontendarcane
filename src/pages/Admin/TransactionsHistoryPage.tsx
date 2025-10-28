import React, { useState, useEffect, useCallback } from 'react';
import styles from './TransactionsHistoryPage.module.css';
import { Eye, Info, Briefcase, FileText, X } from 'react-feather';
import { getOrderDetail, getAllPedidosAdmin } from '../../api/transactionService';
import type { Transaction, TransactionDetail } from '../../types/admin.types';
import { useToast } from '../../hooks/useToast';

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'recibido':
      return { text: 'Completado', className: styles.statusCompleted };
    case 'confirmado':
    case 'enviado':
      return { text: 'Procesando', className: styles.statusProcessing };
    case 'pendiente':
      return { text: 'Pendiente', className: styles.statusPending };
    case 'cancelado':
      return { text: 'Cancelado', className: styles.statusCancelled };
    default:
      return { text: status, className: '' };
  }
};

const TransactionsHistoryPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransactionDetail | null>(null);
  
  // Estados para filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchTransactions = useCallback(async (filters: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllPedidosAdmin(filters);
      setTransactions(data);
    } catch (err: any) { 
      setError(err.message || 'Error al cargar los pedidos.');
      addToast(err.message || 'Error al cargar los pedidos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (dateFrom && dateTo) { // Asegurarse que las fechas iniciales están listas
        const filters = {
          fechaInicio: dateFrom || undefined,
          fechaFin: dateTo || undefined,
          cliente: clientFilter || undefined,
          estado: statusFilter !== 'all' ? statusFilter : undefined,
        };
        fetchTransactions(filters);
      }
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(handler);
    };
  }, [dateFrom, dateTo, clientFilter, statusFilter, fetchTransactions]);

  const openModal = async (orderId: number) => {
    try {
      const orderDetails = await getOrderDetail(orderId);
      setSelectedOrder(orderDetails);
      setIsModalOpen(true);
    } catch (err: any) {
      addToast(err.message || 'Error al cargar el detalle del pedido.', 'error');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value);
  }

  return (
    <div className={styles.mainGrid}>
      <div className={styles.mainContentArea}>
        <div className={styles.componentCard}>
          <div className={styles.componentHeader}>
            <h2 className={styles.componentTitle}>Gestión de Pedidos</h2>
          </div>
          
          <div className={styles.orderManagementToolbar}>
            <div className={styles.filterContainer}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="dateFrom">Fecha desde</label>
                <input 
                  type="date" 
                  className={styles.filterInput} 
                  id="dateFrom" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="dateTo">Fecha hasta</label>
                <input 
                  type="date" 
                  className={styles.filterInput} 
                  id="dateTo" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="clientFilter">Cliente</label>
                <input 
                  type="text" 
                  className={styles.filterInput} 
                  id="clientFilter"
                  placeholder='Nombre o Apellido...'
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel} htmlFor="statusFilter">Estado</label>
                <select 
                  className={styles.filterSelect} 
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Procesando</option>
                  <option value="Recibido">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <p>Cargando pedidos...</p>
            ) : error ? (
              <p className={styles.errorText}>{error}</p>
            ) : (
              <table className={styles.orderDatagrid}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Email</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? transactions.map((transaction) => {
                    const statusInfo = getStatusInfo(transaction.estadoGeneral);
                    return (
                      <tr key={transaction.id}>
                        <td>{`ORD-${transaction.id.toString().padStart(3, '0')}`}</td>
                        <td>{new Date(transaction.fechaPedido).toLocaleDateString()}</td>
                        <td>{transaction.cliente}</td>
                        <td>{transaction.email}</td>
                        <td>{formatCurrency(transaction.montoTotal)}</td>
                        <td><span className={`${styles.statusBadge} ${statusInfo.className}`}>{statusInfo.text}</span></td>
                        <td>
                          <div className={styles.orderActions}>
                            <button className={styles.btnDetail} onClick={() => openModal(transaction.id)}>
                              <Eye size={16} />
                              Ver Detalle
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                        <td colSpan={7} style={{ textAlign: 'center' }}>No se encontraron pedidos con los filtros actuales.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal para ver detalle del pedido */}
          {isModalOpen && selectedOrder && (
            <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
              <div className={styles.orderModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Detalle del Pedido - ORD-{selectedOrder.pedidoId.toString().padStart(3, '0')}</h2>
                  <button className={styles.closeModal} onClick={closeModal}><X /></button>
                </div>
                <div className={styles.modalBody}>

                  {/* SECCIÓN 1: Información General */}
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}><Info size={18} /> Información General</h3>
                    <div className={styles.orderInfoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>ID Pedido</span>
                        <span className={styles.infoValue}>ORD-{selectedOrder.pedidoId.toString().padStart(3, '0' )}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Fecha</span>
                        <span className={styles.infoValue}>{new Date(selectedOrder.fechaPedido).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Monto Total</span>
                        <span className={styles.infoValue}>{formatCurrency(selectedOrder.montoTotal)}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Método de Pago</span>
                        <span className={styles.infoValue}>{selectedOrder.metodoPago}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Estado General</span>
                        <span className={styles.infoValue}>
                          <span className={`${styles.statusBadge} ${getStatusInfo(selectedOrder.estadoGeneral).className}`}>
                            {getStatusInfo(selectedOrder.estadoGeneral).text}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: Dirección de Envío */}
                  <div className={styles.modalSection}>
                    <h3 className={styles.modalSectionTitle}><Briefcase size={18} /> Dirección de Envío</h3>
                    <div className={styles.infoItem}>
                      <span className={styles.infoValue}>{selectedOrder.direccionEnvio}</span>
                    </div>
                  </div>

                  {/* SECCIÓN 3: Paquetes por Negocio */}
                  {selectedOrder.paquetesPorNegocio.map((paquete, index) => (
                    <div className={styles.modalSection} key={index}>
                      <h3 className={styles.modalSectionTitle}><FileText size={18} /> Paquete de: {paquete.nombreNegocio}</h3>
                      <div className={styles.orderInfoGrid}>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Estado del Paquete</span>
                          <span className={styles.infoValue}>
                            <span className={`${styles.statusBadge} ${getStatusInfo(paquete.estado).className}`}>
                              {getStatusInfo(paquete.estado).text}
                            </span>
                          </span>
                        </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Monto del Paquete</span>
                        <span className={styles.infoValue}>{formatCurrency(paquete.totalNegocio)}</span>
                      </div>
                    </div>
                                          <table className={styles.productsTable}>
                                            <thead>
                                              <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio Unit.</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {paquete.items.map((product, prodIndex) => (
                                                <tr key={prodIndex}>
                                                  <td>{product.nombreProducto}</td>
                                                  <td>{product.cantidad}</td>
                                                  <td>{formatCurrency(product.precioCompra)}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>                    </div>
                  ))}
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnClose} onClick={closeModal}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsHistoryPage;
