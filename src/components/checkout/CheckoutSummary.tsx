import React from 'react';
import styles from './Checkout.module.css';
import { API_DOMAIN } from '../../api/endpoints';
import type { CartItem } from '../../context/CartContext';

interface CheckoutSummaryProps {
  items: CartItem[];
  total: number;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ items, total }) => {
  return (
    <div className={styles.summaryContainer}>
      <h3 className={styles.summaryHeader}>Resumen del Pedido</h3>
      
      <div className={styles.summaryItems}>
        {items.map((item) => (
          <div key={item.product.id} className={styles.summaryItem}>
            <img
              src={`${API_DOMAIN}${item.product.imagenUrl}`}
              alt={item.product.nombre}
              className={styles.itemImage}
            />
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.product.nombre}</div>
              <div className={styles.itemDetails}>
                <span>Cantidad: {item.quantity}</span>
                <span>${(item.product.precio * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summaryTotal}>
        <span>Total:</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
