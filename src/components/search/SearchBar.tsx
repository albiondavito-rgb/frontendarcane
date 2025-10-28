import styles from './SearchBar.module.css';
import { Search } from 'react-feather';

interface SearchBarProps {
  value: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onSearchChange, 
  placeholder = 'Buscar productos, categorías...' 
}) => {
  return (
    <div className={styles.searchBar}>
      <input 
        type="text" 
        className={styles.searchInput} 
        placeholder={placeholder} 
        value={value}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Search size={20} className={styles.searchIcon} />
    </div>
  );
};
