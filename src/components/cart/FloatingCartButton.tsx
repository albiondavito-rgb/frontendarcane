import styles from './Cart.module.css';
import { useCart } from '../../context/CartContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ShoppingCart } from 'react-feather';

export const FloatingCartButton = () => {
  const { itemCount, openCart } = useCart();
  const isMobile = useMediaQuery('(max-width: 1024px)');

  // El botón solo es visible si estamos en móvil y hay items en el carrito
  const isVisible = isMobile && itemCount > 0;

  return (
    <button 
      onClick={openCart}
      className={`${styles.floatingCartIcon} ${isVisible ? styles.visible : ''}`}
      title="Ver carrito"
    >
      <ShoppingCart size={28} />
      {itemCount > 0 && (
        <span className={`${styles.cartBadge} ${styles.visible}`}>{itemCount}</span>
      )}
    </button>
  );
};
