import { ArrowLeft, Clock, Box, Truck, CheckCircle, XCircle } from 'react-feather';
import styles from './OrderDetailPanel.module.css';

// El tipo para un pedido, se puede mover a types/pedido.types.ts luego
export type Order = {
  id: number;
  fecha: string;
  cliente: {
    nombre: string;
    apellido: string;
  };
  total: number;
  metodoPago: string;
  productos: {
      nombre: string;
      cantidad: number;
      precio: number;
  }[];
  historialEstados: {
      estado: string;
      fecha: string;
      descripcion: string;
  }[];
};

type OrderDetailPanelProps = {
  order: Order;
  onBack: () => void;
};

const statusConfig = {
    Pendiente: { icon: <Clock size={20} />, text: 'Pendiente de Confirmación', style: styles.statusPendiente },
    Confirmado: { icon: <Box size={20} />, text: 'Pedido Confirmado', style: styles.statusConfirmado },
    Enviado: { icon: <Truck size={20} />, text: 'Pedido Enviado', style: styles.statusEnviado },
    Entregado: { icon: <CheckCircle size={20} />, text: 'Pedido Entregado', style: styles.statusEntregado },
    Rechazado: { icon: <XCircle size={20} />, text: 'Pedido Rechazado', style: styles.statusRechazado },
};

export const OrderDetailPanel = ({ order, onBack }: OrderDetailPanelProps) => {
  const currentStatus = order.historialEstados[0];
  
  // Lógica para mostrar el historial completo de estados basado en el estado actual
  const getTimeline = () => {
    const allPossibleStatus = ['Entregado', 'Enviado', 'Confirmado', 'Pendiente'];
    const historyStates = order.historialEstados.map(h => h.estado);

    if (historyStates.includes('Rechazado')) {
        return order.historialEstados;
    }

    let timeline = [...order.historialEstados];
    let lastKnownStatusIndex = allPossibleStatus.indexOf(currentStatus.estado);

    // Añadir estados futuros como pendientes (sin fecha)
    if (lastKnownStatusIndex > 0) {
        for (let i = lastKnownStatusIndex - 1; i >= 0; i--) {
            timeline.unshift({ estado: allPossibleStatus[i], fecha: '', descripcion: '' });
        }
    }
    return timeline;
  };

  const timelineStatuses = getTimeline();

  return (
    <div>
        <div className={styles.panelHeader}>
            <button className={styles.backButton} onClick={onBack} title="Volver a la lista">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className={styles.panelTitle}>Detalle del Pedido</h2>
                <p className={styles.panelSubtitle}>ID del Pedido: <span className={styles.infoValue}>{order.id}</span></p>
            </div>
        </div>

        {/* Order Info Header Card */}
        <div className={styles.orderInfoCard}>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Cliente</span>
                    <span className={styles.infoValue}>{order.cliente.nombre} {order.cliente.apellido}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha</span>
                    <span className={styles.infoValue}>{new Date(order.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total</span>
                    <span className={`${styles.infoValue} ${styles.highlight}`}>${order.total.toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Método de Pago</span>
                    <span className={styles.infoValue}>{order.metodoPago}</span>
                </div>
            </div>
        </div>

        {/* Status Timeline */}
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLine}></div>
          {timelineStatuses.map((status, index) => {
            const config = statusConfig[status.estado as keyof typeof statusConfig];
            if (!config) return null;

            const isActive = index === 0 && status.fecha !== '';
            const isCompleted = status.fecha !== '' && !isActive;

            return (
              <div key={status.estado} className={`${styles.statusCard} ${config.style} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                <div className={styles.statusHeader}>
                  {config.icon}
                  <h3 className={styles.statusTitle}>{config.text}</h3>
                </div>
                {status.fecha && (
                    <p className={styles.statusDate}>
                        {new Date(status.fecha).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </p>
                )}
                {isActive && status.descripcion && (
                    <p className={styles.statusDescription}>{status.descripcion}</p>
                )}
              </div>
            );
          })}
        </div>
    </div>
  );
};