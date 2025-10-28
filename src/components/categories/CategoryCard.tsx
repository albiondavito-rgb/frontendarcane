import { API_DOMAIN } from '../../api/endpoints';
import styles from './CategoryCard.module.css';
import type { Category } from '../../types/category';

// Define las props que nuestro componente recibirá
type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  const fullImageUrl = `${API_DOMAIN}${category.imagenUrl}`;

  return (
    // En el futuro, este div podría ser un Link de react-router-dom
    <div className={styles.categoryCard}>
      <img src={fullImageUrl} alt={category.nombre} className={styles.categoryImage} />
      <div className={styles.categoryName}>{category.nombre}</div>
    </div>
  );
};
