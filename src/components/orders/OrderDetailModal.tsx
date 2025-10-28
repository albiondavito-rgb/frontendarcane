import { X, Clock, Box, Truck, CheckCircle, XCircle } from 'react-feather';
import styles from './OrderDetailModal.module.css';

// Datos de ejemplo (mock data)
const mockOrder = {
  id: 789123,
  fecha: '2023-10-26T14:30:00Z',
  cliente: {
    nombre: 'Pablo',
    apellido: 'Marmol',
  },
  total: 280.50,
  metodoPago: 'Tarjeta de Crédito **** 4242',
  productos: [
    { nombre: 'Teclado Mecánico RGB', cantidad: 1, precio: 150.00 },
    { nombre: 'Mouse Gamer Inalámbrico', cantidad: 1, precio: 80.50 },
    { nombre: 'Alfombrilla XL', cantidad: 1, precio: 50.00 },
  ],
  historialEstados: [
    { estado: 'Rechazado', fecha: '2023-10-26T15:00:00Z', descripcion: 'El pago no pudo ser procesado.' },
    { estado: 'Pendiente', fecha: '2023-10-26T14:30:00Z', descripcion: 'El pedido ha sido recibido y está pendiente de confirmación.' },
  ]
};

type OrderDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const statusConfig = {
    Pendiente: { icon: <Clock size={20} />, text: 'Pendiente de Confirmación', style: styles.statusPendiente },
    Confirmado: { icon: <Box size={20} />, text: 'Pedido Confirmado', style: styles.statusConfirmado },
    Enviado: { icon: <Truck size={20} />, text: 'Pedido Enviado', style: styles.statusEnviado },
    Entregado: { icon: <CheckCircle size={20} />, text: 'Pedido Entregado', style: styles.statusEntregado },
    Rechazado: { icon: <XCircle size={20} />, text: 'Pedido Rechazado', style: styles.statusRechazado },
};

export const OrderDetailModal = ({ isOpen, onClose }: OrderDetailModalProps) => {
  if (!isOpen) return null;

  const currentStatus = mockOrder.historialEstados[0];
  const allPossibleStatus = ['Entregado', 'Enviado', 'Confirmado', 'Pendiente'];
  // Para el ejemplo de 'Rechazado', mostramos el historial real.
  const timelineStatuses = currentStatus.estado === 'Rechazado' 
    ? mockOrder.historialEstados
    : [currentStatus, ...allPossibleStatus.slice(allPossibleStatus.indexOf(currentStatus.estado) + 1)].map(s => 
        typeof s === 'string' ? { estado: s, fecha: '', descripcion: '' } : s
      );


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Detalle del Pedido</h2>
          <p className={styles.modalSubtitle}>ID del Pedido: <span className={styles.infoValue}>{mockOrder.id}</span></p>
        </div>

        {/* Order Info Header Card */}
        <div className={styles.orderInfoCard}>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Cliente</span>
                    <span className={styles.infoValue}>{mockOrder.cliente.nombre} {mockOrder.cliente.apellido}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha</span>
                    <span className={styles.infoValue}>{new Date(mockOrder.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total</span>
                    <span className={`${styles.infoValue} ${styles.highlight}`}>${mockOrder.total.toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Método de Pago</span>
                    <span className={styles.infoValue}>{mockOrder.metodoPago}</span>
                </div>
            </div>
        </div>

        {/* Status Timeline */}
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLine}></div>
          {timelineStatuses.map((status, index) => {
            const config = statusConfig[status.estado as keyof typeof statusConfig];
            if (!config) return null;

            const isActive = index === 0;
            const isCompleted = !isActive && !!status.fecha;

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
    </div>
  );
};