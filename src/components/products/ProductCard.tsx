import { useState } from 'react';
import styles from './ProductCard.module.css';
import { Star } from 'react-feather';
import type { Product } from '../../types/product';
import { ProductModal } from './ProductModal';

// Define las props que nuestro componente recibirá
type ProductCardProps = {
  product: Product;
};

// Una función de ayuda para renderizar las estrellas de calificación
const renderStars = (rating: number) => {
  const stars = [];
  // Crea 5 estrellas, y las rellena según el rating
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

import { API_DOMAIN } from '../../api/endpoints';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, cartItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscamos si este producto ya está en el carrito para saber su cantidad
  const itemInCart = cartItems.find(item => item.product.id === product.id);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Validar stock disponible
    if (quantityInCart >= product.cantidadStock) {
      return; // No hacer nada si ya se alcanzó el stock máximo
    }
    addToCart(product);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const fullImageUrl = `${API_DOMAIN}${product.imagenUrl}`;

  return (
    <>
      <div className={styles.productCard} onClick={handleCardClick}>
      <img src={fullImageUrl} alt={product.nombre} className={styles.productImage} />
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.nombre}</h3>
        <div className={styles.productPrice}>{product.precio.toFixed(2)} Bs</div>
        <p className={styles.productStock}>{product.cantidadStock} en stock</p>
        <div className={styles.productRating}>
          {renderStars(product.rating || 0)}
          <span className={styles.ratingCount}>({product.reviewCount || 0})</span>
        </div>
        <div className={styles.productFooter}>
          <button 
            className={styles.addToCart} 
            onClick={handleAddToCart}
            disabled={quantityInCart >= product.cantidadStock}
          >
            {quantityInCart >= product.cantidadStock ? 'Sin stock' : 'Añadir al Carrito'}
          </button>
          <span className={`${styles.cartQuantity} ${quantityInCart > 0 ? styles.visible : ''}`}>
            {quantityInCart}
          </span>
        </div>
      </div>
    </div>

    <ProductModal
      product={product}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </>
  );
};
