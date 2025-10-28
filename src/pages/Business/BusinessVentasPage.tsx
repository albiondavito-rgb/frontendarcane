import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPedidosPorNegocio } from '../../api/pedidoService';
import type { PedidoNegocioDto } from '../../types/pedido.types';
import styles from './BusinessVentasPage.module.css';
import { Search, DollarSign, Package, TrendingUp, Calendar, Filter } from 'react-feather';

export const BusinessVentasPage = () => {
  const { negocio } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoNegocioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('Todos');
  const [dateFilter, setDateFilter] = useState<'hoy' | 'semana' | 'mes' | 'todos'>('todos');

  useEffect(() => {
    const businessId = negocio?.negocioId || negocio?.id;
    if (businessId) {
      loadPedidos();
    }
  }, [negocio]);

  const loadPedidos = async () => {
    if (!negocio) return;
    const businessId = negocio.negocioId || negocio.id;
    if (!businessId) return;
    
    try {
      setLoading(true);
      const data = await getPedidosPorNegocio(businessId);
      // Filtrar solo pedidos entregados, que es el estado final válido en la BD.
      const ventasCompletadas = data.filter(p => p.estado === 'Entregado');
      setPedidos(ventasCompletadas);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos por fecha
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return pedidos.filter(pedido => {
      const pedidoDate = new Date(pedido.fechaPedido);
      
      switch (dateFilter) {
        case 'hoy':
          return pedidoDate >= today;
        case 'semana':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return pedidoDate >= weekAgo;
        case 'mes':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return pedidoDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [pedidos, dateFilter]);

  // Filtrar por búsqueda y estado
  const filteredPedidos = useMemo(() => {
    return filteredByDate.filter(pedido => {
      const nombreCompleto = `${pedido.cliente.nombre} ${pedido.cliente.apellido}`;
      const matchesSearch = 
        pedido.pedidoId.toString().includes(searchTerm) ||
        nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = estadoFilter === 'Todos' || pedido.estado === estadoFilter;
      
      return matchesSearch && matchesEstado;
    });
  }, [filteredByDate, searchTerm, estadoFilter]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalVentas = filteredPedidos.reduce((sum, p) => sum + p.totalNegocio, 0);
    const cantidadVentas = filteredPedidos.length;
    const promedioVenta = cantidadVentas > 0 ? totalVentas / cantidadVentas : 0;
    const productosVendidos = filteredPedidos.reduce((sum, p) => {
      return sum + p.items.reduce((itemSum, item) => itemSum + item.cantidad, 0);
    }, 0);

    return {
      totalVentas,
      cantidadVentas,
      promedioVenta,
      productosVendidos
    };
  }, [filteredPedidos]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando historial de ventas...</p>
      </div>
    );
  }

  return (
    <div className={styles.ventasPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Historial de Ventas</h1>
        <p className={styles.pageSubtitle}>Gestiona y analiza tus ventas completadas</p>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-light)' }}>
            <DollarSign size={24} color="var(--success-color)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Total Ventas</p>
            <h3 className={styles.statValue}>${stats.totalVentas.toFixed(2)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--primary-light)' }}>
            <Package size={24} color="var(--primary-color)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Cantidad de Ventas</p>
            <h3 className={styles.statValue}>{stats.cantidadVentas}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-light)' }}>
            <TrendingUp size={24} color="var(--secondary-color)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Promedio por Venta</p>
            <h3 className={styles.statValue}>${stats.promedioVenta.toFixed(2)}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--accent-light)' }}>
            <Package size={24} color="var(--accent-color)" />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Productos Vendidos</p>
            <h3 className={styles.statValue}>{stats.productosVendidos}</h3>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por ID de pedido o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <Calendar size={20} />
          <select
            className={styles.filterSelect}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="todos">Todas las fechas</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Última semana</option>
            <option value="mes">Último mes</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <Filter size={20} />
          <select
            className={styles.filterSelect}
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className={styles.tableCard}>
        {filteredPedidos.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} className={styles.emptyIcon} />
            <h3>No hay ventas registradas</h3>
            <p>Las ventas completadas aparecerán aquí</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.ventasTable}>
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPedidos.map((pedido) => (
                  <tr key={pedido.pedidoNegocioId}>
                    <td className={styles.pedidoId}>#{pedido.pedidoId}</td>
                    <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</td>
                    <td>{pedido.cliente.nombre} {pedido.cliente.apellido}</td>
                    <td className={styles.productoName}>
                      {pedido.items.map(item => item.nombreProducto).join(', ')}
                    </td>
                    <td className={styles.cantidad}>
                      {pedido.items.reduce((sum, item) => sum + item.cantidad, 0)}
                    </td>
                    <td className={styles.subtotal}>${pedido.totalNegocio.toFixed(2)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[pedido.estado.toLowerCase()]}`}>
                        {pedido.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};