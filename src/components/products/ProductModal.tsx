import { useState, useEffect } from 'react';
import { X, ShoppingCart, CreditCard, Star, Minus, Plus } from 'react-feather';
import { useCart } from '../../context/CartContext';
import { API_DOMAIN } from '../../api/endpoints';
import type { Product } from '../../types/product';
import styles from './ProductModal.module.css';
import ProductReviews from '../reviews/ProductReviews'; // Nueva importación

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, product]);

  if (!product) return null;

  const handleAddToCart = () => {
    const itemInCart = cartItems.find(item => item.product.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    
    if (quantityInCart + quantity > product.cantidadStock) {
      addToCart(product, quantity);
    } else {
      addToCart(product, quantity);
      onClose();
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  const incrementQuantity = () => {
    const itemInCart = cartItems.find(item => item.product.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    const availableStock = product.cantidadStock - quantityInCart;
    
    if (quantity < availableStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating: number = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#FFD700' : 'none'} // Relleno amarillo o ninguno
          stroke={'#FFD700'} // Contorno siempre amarillo
          strokeWidth={'1px'} // Para que el contorno sea visible si el relleno es 'none'
        />
      );
    }
    return stars;
  };

  const fullImageUrl = `${API_DOMAIN}${product.imagenUrl}`;

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`} onClick={onClose}>
      <div className={styles.productModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalContent}>
          <div className={styles.modalLeft}>
            <img
              src={fullImageUrl}
              alt={product.nombre}
              className={styles.modalProductImage}
            />
            <div>
              <h3 className={styles.modalSectionTitle}>Descripción</h3>
              <div className={styles.modalDescriptionBox}>
                {product.descripcion || 'Sin descripción disponible.'}
              </div>
            </div>
          </div>

          <div className={styles.modalRight}>
            <div className={styles.modalCategory}>{product.nombreCategoria}</div>
            <h2 className={styles.modalProductName}>{product.nombre}</h2>

            <div className={styles.modalRating}>
              <div className={styles.modalStars}>
                {renderStars(product.rating || 0)}
              </div>
              <span className={styles.modalReviewsCount}>
                ({product.reviewCount || 0} reseñas)
              </span>
            </div>

            <div className={styles.modalBusiness}>
              Vendido por: {product.nombreNegocio}
            </div>

            <div className={styles.modalStock}>
              {(() => {
                const itemInCart = cartItems.find(item => item.product.id === product.id);
                const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                const availableStock = product.cantidadStock - quantityInCart;
                
                if (availableStock > 0) {
                  return (
                    <span className={styles.inStock}>
                      ✓ {availableStock} disponibles
                      {quantityInCart > 0 && ` (${quantityInCart} en carrito)`}
                    </span>
                  );
                } else if (quantityInCart > 0) {
                  return (
                    <span className={styles.outOfStock}>
                      Todo el stock está en tu carrito ({quantityInCart})
                    </span>
                  );
                } else {
                  return <span className={styles.outOfStock}>Sin stock</span>;
                }
              })()}
            </div>

            <div className={styles.priceQuantityContainer}>
              <div className={styles.modalPrice}>{product.precio.toFixed(2)} Bs</div>

              <div className={styles.modalQuantityControl}>
                <span className={styles.modalQuantityLabel}>Cantidad:</span>
                <div className={styles.modalQuantitySelector}>
                  <button
                    className={styles.modalQuantityBtn}
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <span className={styles.modalQuantityValue}>{quantity}</span>
                  <button
                    className={styles.modalQuantityBtn}
                    onClick={incrementQuantity}
                    disabled={(() => {
                      const itemInCart = cartItems.find(item => item.product.id === product.id);
                      const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                      const availableStock = product.cantidadStock - quantityInCart;
                      return quantity >= availableStock;
                    })()}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.modalActionButtons}>
              <button
                className={styles.modalCartBtn}
                onClick={handleAddToCart}
                disabled={(() => {
                  const itemInCart = cartItems.find(item => item.product.id === product.id);
                  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                  const availableStock = product.cantidadStock - quantityInCart;
                  return availableStock === 0;
                })()}
              >
                <ShoppingCart size={18} />
                Añadir al Carrito
              </button>
              <button
                className={styles.modalBuyBtn}
                onClick={handleBuyNow}
                disabled={(() => {
                  const itemInCart = cartItems.find(item => item.product.id === product.id);
                  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                  const availableStock = product.cantidadStock - quantityInCart;
                  return availableStock === 0;
                })()}
              >
                <CreditCard size={18} />
                Comprar Ahora
              </button>
            </div>

            {/* Sección de Reseñas */}
            <div className={styles.modalReviewsContainer}>
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};