import { useState, useEffect } from 'react';
import { ComponentCard } from '../../components/shared/ComponentCard';
import { SearchBar } from '../../components/search/SearchBar';
import { HorizontalScroller } from '../../components/shared/HorizontalScroller';
import { ProductCard } from '../../components/products/ProductCard';
import { CategoryCard } from '../../components/categories/CategoryCard';
import { Link } from 'react-router-dom';
import { BusinessCard } from '../../components/businesses/BusinessCard';
import { ENDPOINTS } from '../../api/endpoints';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import type { Business } from '../../types/negocio';
import styles from './Home.module.css';

// Imports for Live Search
import { globalSearch } from '../../api/searchService';
import type { GlobalSearchResult } from '../../types/search.types';
import { SearchResultsDropdown } from '../../components/search/SearchResultsDropdown';

export const HomePage = () => {
    // State for featured items
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);

    // State for live search
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch featured items on initial load
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [productsRes, categoriesRes, businessesRes] = await Promise.all([
                    fetch(ENDPOINTS.PRODUCTOS.GET_PRINCIPALES),
                    fetch(ENDPOINTS.CATEGORIAS.GET_PRINCIPALES),
                    fetch(ENDPOINTS.NEGOCIOS.GET_PRINCIPALES),
                ]);
                
                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();
                const businessesData = await businessesRes.json();
                
                setProducts(productsData);
                setCategories(categoriesData);
                setBusinesses(businessesData);
            } catch (error) {
                console.error('Error al cargar datos destacados:', error);
            }
        };

        fetchAllData();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const debounceTimer = setTimeout(async () => {
            try {
                const results = await globalSearch(searchTerm);
                setSearchResults(results);
            } catch (error) {
                console.error("Error en la búsqueda:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce time

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [searchTerm]);


    const renderSectionHeader = (title: string) => (
        <div className={styles.sectionHeader}>
            <h2>{title}</h2>
        </div>
    );

    return (
        <div className={styles.homePage}>
            <ComponentCard title="Buscar Productos, Negocios y Categorías">
                <div className={styles.searchContainer}>
                    <SearchBar 
                        value={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Busca en todo el catálogo..."
                    />
                    {searchTerm && (
                        <SearchResultsDropdown 
                            results={searchResults}
                            isLoading={isSearching}
                        />
                    )}
                </div>
            </ComponentCard>

            <section id="productos">
                <ComponentCard title="Productos Destacados">
                    {renderSectionHeader("Productos Destacados")}
                    <HorizontalScroller>
                        {products.slice(0, 10).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </HorizontalScroller>
                </ComponentCard>
            </section>

            <section id="categorias">
                <ComponentCard title="Categorías Populares">
                    {renderSectionHeader("Categorías Populares")}
                    <HorizontalScroller>
                        {categories.slice(0, 10).map(category => (
                            <Link to={`/explorar?tab=categorias&id=${category.id}`} key={category.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <CategoryCard category={category} />
                            </Link>
                        ))}
                    </HorizontalScroller>
                </ComponentCard>
            </section>

            <section id="negocios">
                <ComponentCard title="Negocios Populares">
                    {renderSectionHeader("Negocios Populares")}
                    <HorizontalScroller>
                        {businesses.slice(0, 10).map(business => (
                            <Link to={`/explorar?tab=negocios&id=${business.id}`} key={business.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <BusinessCard business={business} />
                            </Link>
                        ))}
                    </HorizontalScroller>
                </ComponentCard>
            </section>
        </div>
    );
};