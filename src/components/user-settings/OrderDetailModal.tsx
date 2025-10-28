import { useState } from 'react';
import styles from './OrderDetailModal.module.css';
import { formatCurrency } from '../../utils/currency';
import { descargarFacturaPdf } from '../../api/facturaService';
import type { PedidoHistorialDetalleDto, PedidoItemHistorialDto } from '../../types/pedido.types';
import { ReviewModal } from '../products/ReviewModal'; // Importar el modal de reseñas

interface OrderDetailModalProps {
  order: PedidoHistorialDetalleDto;
  onClose: () => void;
  onReviewSuccess: () => void; // Nueva prop
}

export const OrderDetailModal = ({ order, onClose, onReviewSuccess }: OrderDetailModalProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PedidoItemHistorialDto | null>(null);

  const handleDescargarFactura = async () => {
    setIsDownloading(true);
    try {
      await descargarFacturaPdf(order.pedidoId);
    } catch (error) {
      console.error('Error al descargar la factura:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      alert(`No se pudo descargar la factura: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReviewClick = (product: PedidoItemHistorialDto) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  // Esta función ahora solo cierra el modal, la notificación al padre se hace directamente en el onSuccess del ReviewModal
  const handleReviewSuccess = () => {
    handleCloseReviewModal();
  };

  const subtotal = order.items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
          
          <div className={styles.modalHeader}>
            <h3>Detalle del Pedido</h3>
            <p>ID del Pedido: #{order.pedidoId}</p>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.section}>
              <h4>Información de Facturación</h4>
              <div className={styles.infoGrid}>
                <p><strong>Razón Social:</strong> {order.razonSocial || 'N/A'}</p>
                <p><strong>NIT:</strong> {order.nit || 'N/A'}</p>
                <p><strong>Fecha:</strong> {new Date(order.fechaPedido).toLocaleDateString('es-ES')}</p>
                <p><strong>Método de Pago:</strong> {order.metodoPago}</p>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Productos</h4>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productoId}>
                      <td>{item.nombreProducto}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCurrency(item.precioUnitario)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                      <td>
                        <button 
                          className={styles.reviewButton} 
                          onClick={() => handleReviewClick(item)}
                        >
                          Reseñar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.summarySection}>
              <div className={styles.summaryLine}>
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Envío:</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className={`${styles.summaryLine} ${styles.total}`}>
                <span>Total Pagado:</span>
                <span>{formatCurrency(order.totalPagado)}</span>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              className={styles.printButton} 
              onClick={handleDescargarFactura}
              disabled={isDownloading}
            >
              {isDownloading ? 'Descargando...' : 'Imprimir Factura'}
            </button>
          </div>
        </div>
      </div>

      {showReviewModal && selectedProduct && (
        <ReviewModal
          product={selectedProduct}
          onClose={handleCloseReviewModal}
          onSuccess={() => {
            handleReviewSuccess(); // Cierra el modal
            onReviewSuccess(); // Notifica al padre
          }}
        />
      )}
    </>
  );
};