import { API_DOMAIN } from '../../api/endpoints';
import styles from './BusinessCard.module.css';
import type { Business } from '../../types/negocio';

// Define las props que nuestro componente recibirá
type BusinessCardProps = {
  business: Business;
};

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const fullImageUrl = `${API_DOMAIN}${business.imagenPerfilUrl}`;

  return (
    // En el futuro, este div podría ser un Link que lleve a la página del negocio
    <div className={styles.businessCard}>
      <img src={fullImageUrl} alt={business.nombre} className={styles.businessImage} />
      <div className={styles.businessName}>{business.nombre}</div>
    </div>
  );
};
