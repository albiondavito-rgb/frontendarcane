import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import styles from './RecommendedProducts.module.css';
import { API_DOMAIN } from '../../api/endpoints';
import { useState } from 'react';
import { ProductModal } from '../products/ProductModal';

type RecommendedProductsProps = {
  products: Product[];
};

export const RecommendedProducts = ({ products }: RecommendedProductsProps) => {
  console.log('Productos recibidos en RecommendedProducts:', products);
  
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={styles.recommendedProducts}>
        <h4 className={styles.recommendedTitle}>Productos recomendados:</h4>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div 
              key={product.id} 
              className={styles.recommendedProduct}
              onClick={() => handleProductClick(product)}
            >
              <img 
                src={`${API_DOMAIN}${product.imagenUrl}`} 
                alt={product.nombre} 
                className={styles.productImage} 
              />
              <div className={styles.productInfo}>
                <h5 className={styles.productName}>{product.nombre}</h5>
                <p className={styles.productPrice}>${product.precio.toFixed(2)}</p>
                <button 
                  className={styles.addToCartBtn}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.cantidadStock <= 0}
                >
                  {product.cantidadStock <= 0 ? 'Sin stock' : 'Añadir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
