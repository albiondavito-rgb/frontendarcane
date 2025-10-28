import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ClientOrderConfirmationPage.module.css';
import { CheckCircle, Package, FileText, ArrowRight } from 'react-feather';
import { getPedidoDetalle } from '../../api/pedidoService';
import type { PedidoDetalleDto, PedidoNegocioDetalleDto, PedidoItemDetalleDto } from '../../types/pedido.types';

export const ClientOrderConfirmationPage: React.FC = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pedidoId) {
      loadPedido(parseInt(pedidoId));
    }
  }, [pedidoId]);

  const loadPedido = async (id: number) => {
    try {
      setLoading(true);
      const data = await getPedidoDetalle(id);
      setPedido(data);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando confirmación...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className={styles.errorContainer}>
        <p>No se pudo cargar la información del pedido.</p>
        <button onClick={() => navigate('/explorar')} className={styles.btnPrimary}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className={styles.confirmationPage}>
      <div className={styles.container}>
        {/* Mensaje de éxito */}
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h1 className={styles.successTitle}>¡Pedido realizado con éxito!</h1>
          <p className={styles.successMessage}>
            Tu pedido ha sido confirmado y está siendo procesado
          </p>
          <div className={styles.orderNumber}>
            Pedido #{pedido.pedidoId.toString().padStart(8, '0')}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className={styles.summaryCard}>
          <h2 className={styles.cardTitle}>Resumen del Pedido</h2>
          
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total pagado:</span>
              <span className={styles.summaryValue}>${pedido.montoTotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Método de pago:</span>
              <span className={styles.summaryValue}>{pedido.metodoPago}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Estado:</span>
              <span className={`${styles.summaryValue} ${styles.statusBadge}`}>
                {pedido.estadoGeneral}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Dirección:</span>
              <span className={styles.summaryValue}>{pedido.direccionEnvio}</span>
            </div>
          </div>

          {/* Productos por negocio */}
          <div className={styles.businessGroups}>
            <h3 className={styles.sectionTitle}>Productos ({pedido.paquetesPorNegocio.length} negocio{pedido.paquetesPorNegocio.length > 1 ? 's' : ''})</h3>
            {pedido.paquetesPorNegocio.map((paquete: PedidoNegocioDetalleDto) => (
              <div key={paquete.pedidoNegocioId} className={styles.businessGroup}>
                <div className={styles.businessHeader}>
                  <Package size={18} />
                  <span>{paquete.nombreNegocio}</span>
                </div>
                <div className={styles.itemsList}>
                  {paquete.items.map((item: PedidoItemDetalleDto) => (
                    <div key={item.productoId} className={styles.item}>
                      <span>{item.nombreProducto} x{item.cantidad}</span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className={styles.actions}>
          <button
            onClick={() => navigate(`/pedido/${pedido.pedidoId}`)}
            className={styles.btnSecondary}
          >
            <FileText size={18} />
            Ver Detalle del Pedido
          </button>
          <button
            onClick={() => navigate('/explorar')}
            className={styles.btnPrimary}
          >
            Seguir Comprando
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Información adicional */}
        <div className={styles.infoCard}>
          <p>📧 Recibirás un correo de confirmación con los detalles de tu pedido.</p>
          <p>📦 Podrás hacer seguimiento de tu pedido desde tu perfil.</p>
          <p>💬 Si tienes alguna pregunta, contacta al negocio directamente.</p>
        </div>
      </div>
    </div>
  );
};
