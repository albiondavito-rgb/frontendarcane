
import React, { useEffect, useState } from 'react';
import { getResenasPorProducto } from '../../api/resenaService';
import type { ResenaDto } from '../../types/resena.types';
import StarRating from './StarRating';

interface ProductReviewsProps {
  productId: number;
  onReviewSubmitted?: boolean; // Nuevo prop para disparar la recarga
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState<ResenaDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await getResenasPorProducto(productId);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, onReviewSubmitted]); // Recargar cuando productId o onReviewSubmitted cambien

  if (loading) {
    return <p>Cargando reseñas...</p>;
  }

  if (reviews.length === 0) {
    return <p>Este producto aún no tiene reseñas.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Reseñas de Clientes</h3>
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded-lg">
          <div className="flex items-center mb-2">
            <div className="font-semibold mr-2">{review.nombreUsuario}</div>
            <StarRating rating={review.calificacion} onRatingChange={() => {}} readOnly={true} />
          </div>
          <p className="text-gray-600">{review.comentario}</p>
          <div className="text-sm text-gray-400 mt-2">
            {new Date(review.fechaResena).toLocaleDateString('es-ES')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductReviews;
