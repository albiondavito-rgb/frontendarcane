import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPedidosPorNegocio, updatePedidoEstado } from '../../api/pedidoService';
import type { PedidoNegocioDto } from '../../types/pedido.types';
import styles from './BusinessPedidosPage.module.css';
import { formatCurrency } from '../../utils/currency';
import { 
    Search, 
    Calendar, 
    Loader, 
    Package, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Box, 
    Truck, 
    User,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon
} from 'react-feather';

export const BusinessPedidosPage = () => {
    const { negocio } = useAuth();
    const [pedidos, setPedidos] = useState<PedidoNegocioDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('Todos');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [updatingPedidoId, setUpdatingPedidoId] = useState<number | null>(null);

    useEffect(() => {
        loadPedidos();
    }, [negocio]);

    const loadPedidos = async () => {
        if (!negocio) return;
        const businessId = negocio.negocioId || negocio.id;
        if (!businessId) return;
        
        try {
            setLoading(true);
            const data = await getPedidosPorNegocio(businessId);
            setPedidos(data);
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            showNotification('error', 'Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEstado = async (pedidoNegocioId: number, nuevoEstado: string) => {
        try {
            setUpdatingPedidoId(pedidoNegocioId);
            await updatePedidoEstado(pedidoNegocioId, nuevoEstado);
            
            // Actualizar localmente
            setPedidos(prev => prev.map(p => 
                p.pedidoNegocioId === pedidoNegocioId 
                    ? { ...p, estado: nuevoEstado }
                    : p
            ));
            
            showNotification('success', 'Estado actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            showNotification('error', error instanceof Error ? error.message : 'Error al actualizar estado');
        } finally {
            setUpdatingPedidoId(null);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(pedido => {
            const matchesSearch = 
                (pedido.cliente?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pedido.cliente?.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (pedido.cliente?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                pedido.pedidoId.toString().includes(searchTerm);
            
            const matchesEstado = filterEstado === 'Todos' || pedido.estado.toLowerCase() === filterEstado.toLowerCase();
            
            return matchesSearch && matchesEstado;
        });
    }, [pedidos, searchTerm, filterEstado]);

    const getStatusConfig = (estado: string) => {
        const estadoLower = estado.toLowerCase();
        if (estadoLower === 'pendiente') return { text: 'Pendiente', icon: <Clock size={14} />, class: styles.statusPendiente };
        if (estadoLower === 'confirmado') return { text: 'Confirmado', icon: <Box size={14} />, class: styles.statusConfirmado };
        if (estadoLower === 'enviado') return { text: 'Enviado', icon: <Truck size={14} />, class: styles.statusEnviado };
        if (estadoLower === 'entregado') return { text: 'Entregado', icon: <CheckCircleIcon size={14} />, class: styles.statusEntregado };
        if (estadoLower === 'rechazado') return { text: 'Rechazado', icon: <XCircleIcon size={14} />, class: styles.statusRechazado };
        return { text: estado, icon: <Clock size={14} />, class: styles.statusPendiente };
    };

    const getActionButtons = (pedido: PedidoNegocioDto) => {
        const estado = pedido.estado.toLowerCase();
        if (estado === 'pendiente') {
            return (
                <>
                    <button 
                        className={`${styles.actionBtn} ${styles.confirmBtn}`} 
                        onClick={() => handleUpdateEstado(pedido.pedidoNegocioId, 'Confirmado')}
                        disabled={updatingPedidoId === pedido.pedidoNegocioId}
                    >
                        <CheckCircle size={16} />
                        Confirmar
                    </button>
                    <button 
                        className={`${styles.actionBtn} ${styles.rejectBtn}`} 
                        onClick={() => handleUpdateEstado(pedido.pedidoNegocioId, 'Rechazado')}
                        disabled={updatingPedidoId === pedido.pedidoNegocioId}
                    >
                        <XCircle size={16} />
                        Rechazar
                    </button>
                </>
            );
        } else if (estado === 'confirmado') {
            return (
                <button 
                    className={`${styles.actionBtn} ${styles.shipBtn}`} 
                    onClick={() => handleUpdateEstado(pedido.pedidoNegocioId, 'Enviado')}
                    disabled={updatingPedidoId === pedido.pedidoNegocioId}
                >
                    <Truck size={16} />
                    Enviar Pedido
                </button>
            );
        } else if (estado === 'enviado') {
            return (
                <button 
                    className={`${styles.actionBtn} ${styles.deliverBtn}`} 
                    onClick={() => handleUpdateEstado(pedido.pedidoNegocioId, 'Entregado')}
                    disabled={updatingPedidoId === pedido.pedidoNegocioId}
                >
                    <CheckCircleIcon size={16} />
                    Confirmar Llegada
                </button>
            );
        } else {
            return null;
        }
    };

    if (!negocio) {
        return <div>Cargando información del negocio...</div>;
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
                <p>Cargando pedidos...</p>
            </div>
        );
    }

    return (
        <div className={styles.pedidosContainer}>
            {notification && (
                <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Gestión de Pedidos</h1>
                <p className={styles.pageSubtitle}>Administra y actualiza el estado de tus pedidos</p>
            </div>

            <div className={styles.componentCard}>
                <div className={styles.componentHeader}>
                    <h2 className={styles.componentTitle}>Pedidos del Negocio</h2>
                </div>
                
                <div className={styles.controlsRow}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Buscar por cliente, email o ID de pedido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filterTabs}>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Todos' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Todos')}
                    >
                        Todos
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Pendiente' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Pendiente')}
                    >
                        <Clock size={16} />
                        Pendientes
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Confirmado' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Confirmado')}
                    >
                        <Box size={16} />
                        Confirmados
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Enviado' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Enviado')}
                    >
                        <Truck size={16} />
                        Enviados
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Entregado' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Entregado')}
                    >
                        <CheckCircleIcon size={16} />
                        Entregados
                    </button>
                    <button 
                        className={`${styles.filterTab} ${filterEstado === 'Rechazado' ? styles.active : ''}`}
                        onClick={() => setFilterEstado('Rechazado')}
                    >
                        <XCircleIcon size={16} />
                        Rechazados
                    </button>
                </div>

                {filteredPedidos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Package size={64} className={styles.emptyIcon} />
                        <h3>No hay pedidos</h3>
                        <p>{searchTerm || filterEstado !== 'Todos' ? 'No se encontraron pedidos con los filtros aplicados' : 'Aún no tienes pedidos en tu negocio'}</p>
                    </div>
                ) : (
                    <div className={styles.ordersGrid}>
                        {filteredPedidos.map((pedido) => {
                            const statusConfig = getStatusConfig(pedido.estado);
                            return (
                                <div key={pedido.pedidoNegocioId} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <div>
                                            <h3 className={styles.orderTitle}>Pedido <span className={styles.orderId}>#{pedido.pedidoId}</span></h3>
                                        </div>
                                        <div className={`${styles.orderStatus} ${statusConfig.class}`}>
                                            {statusConfig.icon}
                                            {statusConfig.text}
                                        </div>
                                    </div>
                                    <div className={styles.orderBody}>
                                        <div className={styles.orderDetail}>
                                            <div className={styles.detailIcon}>
                                                <User size={16} />
                                            </div>
                                            <span className={styles.detailText}>
                                                <span className={styles.detailLabel}>Cliente:</span> 
                                                {pedido.cliente?.nombre || ''} {pedido.cliente?.apellido || ''}
                                            </span>
                                        </div>
                                        <div className={styles.orderDetail}>
                                            <div className={styles.detailIcon}>
                                                <Calendar size={16} />
                                            </div>
                                            <span className={styles.detailText}>
                                                <span className={styles.detailLabel}>Fecha:</span> 
                                                {new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className={styles.productList}>
                                            {pedido.items.map((item, idx) => (
                                                <div key={idx} className={styles.productItem}>
                                                    <span className={styles.productName}>
                                                        {item.cantidad} x <Link to={`/explore?search=${encodeURIComponent(item.nombreProducto)}`} className={styles.productLink}>{item.nombreProducto}</Link>
                                                    </span>
                                                    <span className={styles.productPrice}>{formatCurrency(item.subtotal || 0)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.orderFooter}>
                                        <div className={styles.orderTotal}>
                                            <span className={styles.totalLabel}>Total:</span>
                                            <span className={styles.totalAmount}>{formatCurrency(pedido.totalNegocio)}</span>
                                        </div>
                                        <div className={styles.orderActions}>
                                            {getActionButtons(pedido)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};