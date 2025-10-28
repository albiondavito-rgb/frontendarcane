import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ClientOrderDetailPage.module.css';
import { ArrowLeft, MapPin, CreditCard, FileText, Package, Check, MessageSquare } from 'react-feather';
import { getPedidoDetalle } from '../../api/pedidoService';
import { descargarFacturaPdf } from '../../api/facturaService'; // Importar la nueva función
import { API_DOMAIN } from '../../api/endpoints';
import type { PedidoDetalleDto, PedidoNegocioDetalleDto, PedidoItemDetalleDto } from '../../types/pedido.types';
import { ReviewModal } from '../../components/products/ReviewModal';

export const ClientOrderDetailPage: React.FC = () => {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoDetalleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PedidoItemDetalleDto | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false); // Nuevo estado

  useEffect(() => {
    if (pedidoId) {
      loadPedido(parseInt(pedidoId));
    }
  }, [pedidoId, reviewSubmitted]); // Añadir reviewSubmitted a las dependencias

  const loadPedido = async (id: number) => {
    try {
      console.log(`Cargando pedido con ID: ${id}`);
      setLoading(true);
      const data = await getPedidoDetalle(id);
      console.log('Datos recibidos de la API:', data);
      setPedido(data);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    } finally {
      setLoading(false);
      if (reviewSubmitted) setReviewSubmitted(false); // Resetear después de recargar
    }
  };

  const handleOpenReviewModal = (product: PedidoItemDetalleDto) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedProduct(null);
    setShowReviewModal(false);
  };

  const handleReviewSuccess = () => {
    setReviewSubmitted(true); // Activar la recarga del pedido
    handleCloseReviewModal(); // Cerrar el modal después del éxito
  };

  const handleDescargarFactura = async () => {
    if (!pedidoId) return;

    setIsDownloading(true);
    try {
      await descargarFacturaPdf(parseInt(pedidoId));
    } catch (error) {
      console.error('Error al descargar la factura:', error);
      alert('No se pudo descargar la factura. Por favor, intente más tarde.');
    } finally {
      setIsDownloading(false);
    }
  };

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

  const getEstadoIndex = (estado: string): number => {
    const estados = ['Pendiente', 'Confirmado', 'Enviado', 'Recibido'];
    return estados.indexOf(estado);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando detalle...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className={styles.errorContainer}>
        <p>No se pudo cargar el pedido.</p>
        <button onClick={() => navigate('/mis-pedidos')} className={styles.btnPrimary}>
          Volver a Mis Pedidos
        </button>
      </div>
    );
  }

  const estadoActualIndex = getEstadoIndex(pedido.estadoGeneral);

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={() => navigate('/mis-pedidos')} className={styles.btnBack}>
            <ArrowLeft size={20} />
            Volver
          </button>
          <div>
            <h1 className={styles.title}>
              Pedido #{pedido.numeroPedido}
            </h1>
            <span className={`${styles.statusBadge} ${styles[getEstadoColor(pedido.estadoGeneral)]}`}>
              {pedido.estadoGeneral}
            </span>
          </div>
        </div>

        {/* Timeline de estados */}
        <div className={styles.timeline}>
          {['Pendiente', 'Confirmado', 'Enviado', 'Recibido'].map((estado, index) => (
            <div
              key={estado}
              className={`${styles.timelineItem} ${index <= estadoActualIndex ? styles.completed : ''}`}
            >
              <div className={styles.timelineIcon}>
                {index < estadoActualIndex ? <Check size={20} /> : index + 1}
              </div>
              <div className={styles.timelineLabel}>{estado}</div>
            </div>
          ))}
        </div>

        <div className={styles.content}>
          {/* Columna izquierda */}
          <div className={styles.mainColumn}>
            {/* Información del pedido */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Información del Pedido</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha:</span>
                  <span className={styles.infoValue}>
                    {new Date(pedido.fechaPedido).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span>Total:</span>
                  <span>${pedido.montoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Productos por negocio */}
            {pedido.paquetesPorNegocio.map((paquete: PedidoNegocioDetalleDto) => (
              <div key={paquete.pedidoNegocioId} className={styles.card}>
                <div className={styles.businessHeader}>
                  <Package size={20} />
                  <div>
                    <h3 className={styles.businessName}>{paquete.nombreNegocio}</h3>
                    <span className={`${styles.miniStatusBadge} ${styles[getEstadoColor(paquete.estado)]}`}>
                      {paquete.estado}
                    </span>
                  </div>
                </div>

                <div className={styles.productsList}>
                  {paquete.items.map((item: PedidoItemDetalleDto) => (
                    <div key={item.productoId} className={styles.productItem}>
                      <img
                        src={`${API_DOMAIN}${item.imagenUrl}`}
                        alt={item.nombreProducto}
                        className={styles.productImage}
                      />
                      <div className={styles.productInfo}>
                        <div className={styles.productName}>{item.nombreProducto}</div>
                        <div className={styles.productPrice}>
                          ${item.precioCompra.toFixed(2)} x {item.cantidad}
                        </div>
                      </div>
                      <div className={styles.productSubtotal}>
                        ${item.subtotal.toFixed(2)}
                      </div>
                      {pedido.estadoGeneral === 'Recibido' && (
                        <button
                          onClick={() => handleOpenReviewModal(item)}
                          className={styles.btnReview}
                        >
                          <MessageSquare size={16} />
                          Escribir Reseña
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.businessTotal}>
                  <span>Subtotal:</span>
                  <span>${paquete.totalNegocio.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div className={styles.sideColumn}>
            {/* Dirección de envío */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <MapPin size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Dirección de Envío
              </h3>
              <p className={styles.address}>{pedido.direccionEnvio}</p>
            </div>

            {/* Método de pago */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Método de Pago
              </h3>
              <p className={styles.paymentMethod}>{pedido.metodoPago}</p>
            </div>

            {/* Resumen de pago */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Resumen</h3>
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>${pedido.montoTotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span>Total:</span>
                  <span>${pedido.montoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botón de factura */}
            <button 
              className={styles.btnInvoice}
              onClick={handleDescargarFactura}
              disabled={isDownloading}
            >
              <FileText size={18} />
              {isDownloading ? 'Descargando...' : 'Ver Factura'}
            </button>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          product={selectedProduct}
          onClose={handleCloseReviewModal}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};