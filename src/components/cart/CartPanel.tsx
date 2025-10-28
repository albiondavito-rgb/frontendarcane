import styles from './Cart.module.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2 } from 'react-feather';
import { API_DOMAIN } from '../../api/endpoints';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export const CartPanel = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    itemCount, 
    cartTotal, 
    increaseQuantity, 
    decreaseQuantity, 
    removeFromCart 
  } = useCart();

  const isMobile = useMediaQuery('(max-width: 1024px)');

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* El fondo oscuro solo se renderiza en móvil cuando el carrito está abierto */}
      {isMobile && (
        <div 
          className={`${styles.backdrop} ${isCartOpen ? styles.isOpen : ''}`}
          onClick={closeCart}
        />
      )}
      <aside className={`${styles.cartPanel} ${isCartOpen ? styles.isOpen : ''}`}>
        <header className={styles.cartHeader}>
          <h2 className="component-title">Carrito ({itemCount})</h2>
          <button onClick={closeCart} className={styles.closeCartBtn} title="Cerrar carrito">
            <X size={24} />
          </button>
        </header>

        <div className={styles.cartItems}>
          {cartItems.length === 0 ? (
            <p className={styles.emptyCart}>Tu carrito está vacío.</p>
          ) : (
            cartItems.map(item => {
              const imageUrl = `${API_DOMAIN}${item.product.imagenUrl}`;
              return (
              <div key={item.product.id} className={styles.cartItem}>
                <img src={imageUrl} alt={item.product.nombre} className={styles.cartItemImage} />
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemHeader}>
                    <div className={styles.cartItemTitle}>{item.product.nombre}</div>
                    <button onClick={() => removeFromCart(item.product.id)} className={styles.cartItemRemoveBtn} title="Eliminar item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={styles.cartItemFooter}>
                    <div className={styles.cartItemQuantityControls}>
                      <button onClick={() => decreaseQuantity(item.product.id)} className={styles.quantityBtn}><Minus size={14} /></button>
                      <span className={styles.cartItemQuantity}>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.product.id)} className={styles.quantityBtn}><Plus size={14} /></button>
                    </div>
                    <div className={styles.cartItemPrice}>${(item.product.precio * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className={styles.cartSummary}>
            <div className={styles.cartTotal}>Total: ${cartTotal.toFixed(2)}</div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceder al Pago
            </button>
          </footer>
        )}
      </aside>
    </>
  );
};
