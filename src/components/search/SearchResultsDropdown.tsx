import React from 'react';
import type { GlobalSearchResult } from '../../types/search.types';
import { SearchResultItem } from './SearchResultItem';
import styles from './SearchResultsDropdown.module.css';
import { Loader } from 'react-feather';

interface SearchResultsDropdownProps {
  results: GlobalSearchResult[];
  isLoading: boolean;
}

export const SearchResultsDropdown: React.FC<SearchResultsDropdownProps> = ({ results, isLoading }) => {
  return (
    <div className={styles.dropdownContainer}>
      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader className={styles.spinner} size={20} />
          <span>Buscando...</span>
        </div>
      ) : results.length === 0 ? (
        <div className={styles.emptyState}>
          <span>No se encontraron resultados.</span>
        </div>
      ) : (
        <ul className={styles.resultsList}>
          {results.map((result) => (
            <SearchResultItem key={`${result.tipo}-${result.id}`} result={result} />
          ))}
        </ul>
      )}
    </div>
  );
};
