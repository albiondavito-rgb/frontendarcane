import React from 'react';
import { Link } from 'react-router-dom';
import type { GlobalSearchResult } from '../../types/search.types';
import { API_DOMAIN } from '../../api/endpoints';
import styles from './SearchResultItem.module.css';
import { Package, ShoppingBag, Grid, Image as ImageIcon } from 'react-feather';

interface SearchResultItemProps {
  result: GlobalSearchResult;
}

const getResultDetails = (result: GlobalSearchResult) => {
  switch (result.tipo) {
    case 'Producto':
      return {
        to: `/explorar?tab=productos&q=${encodeURIComponent(result.nombre)}`,
        icon: <Package size={18} className={styles.itemIcon} />,
      };
    case 'Negocio':
      return {
        to: `/explorar?tab=negocios&id=${result.id}`,
        icon: <ShoppingBag size={18} className={styles.itemIcon} />,
      };
    case 'Categoria':
      return {
        to: `/explorar?tab=categorias&id=${result.id}`,
        icon: <Grid size={18} className={styles.itemIcon} />,
      };
    default:
      return { to: '/', icon: null };
  }
};

export const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
  const { to, icon } = getResultDetails(result);
  const imageUrl = result.imagenUrl ? `${API_DOMAIN}${result.imagenUrl}` : null;

  return (
    <li className={styles.itemWrapper}>
      <Link to={to} className={styles.itemLink}>
        <div className={styles.itemImage}>
          {imageUrl ? (
            <img src={imageUrl} alt={result.nombre} />
          ) : (
            <ImageIcon size={24} className={styles.placeholderIcon} />
          )}
        </div>
        <div className={styles.itemContent}>
          <span className={styles.itemName}>{result.nombre}</span>
          {result.contexto && <span className={styles.itemContext}>{result.contexto}</span>}
        </div>
        <div className={styles.itemType}>
          {icon}
          <span>{result.tipo}</span>
        </div>
      </Link>
    </li>
  );
};
