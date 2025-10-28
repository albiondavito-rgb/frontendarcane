import React, { useState } from 'react';
import styles from './ReviewModal.module.css';
import { X, Star, Send } from 'react-feather';
import { createResena } from '../../api/resenaService';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../api/endpoints';

interface ProductForReview {
  productoId: number;
  nombreProducto: string;
  imagenUrl?: string;
}

interface ReviewModalProps {
  product: ProductForReview | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ product, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    if (rating === 0) {
      setError('Por favor, selecciona una calificación de estrellas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createResena({
        usuarioId: user.id,
        productoId: product.productoId,
        calificacion: rating,
        comentario: comment,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiError = err.message || 'Error al enviar la reseña.';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>
        
        <h2 className={styles.title}>Tu opinión nos importa</h2>

        <div className={styles.productInfo}>
          {product.imagenUrl && (
            <img 
              src={`${API_DOMAIN}${product.imagenUrl}`}
              alt={product.nombreProducto} 
              className={styles.productImage} 
            />
          )}
          <p className={styles.productName}>{product.nombreProducto}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div 
            className={styles.rating}
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                className={`${styles.star} ${(hoverRating || rating) >= star ? styles.filled : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
              />
            ))}
          </div>

          <textarea
            className={styles.comment}
            placeholder="¿Qué te pareció el producto? (Opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            <Send size={18} />
            {loading ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </form>
      </div>
    </div>
  );
};
