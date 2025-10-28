import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/products/ProductCard';
import { CategoryCard } from '../../components/categories/CategoryCard';
import { getAllProducts } from '../../api/productService';
import { getAllCategories } from '../../api/categoryService';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import styles from './ClientCategoriesPage.module.css';
import { ArrowLeft, Grid } from 'react-feather';

export const ClientCategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get('categoria');
    if (categoryId) {
      setSelectedCategoryId(Number(categoryId));
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSearchParams({ categoria: categoryId.toString() });
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSearchParams({});
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.categoriaId === selectedCategoryId)
    : [];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className={styles.categoriesPage}>
      {!selectedCategoryId ? (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Categorías</h1>
            <p className={styles.pageSubtitle}>Explora productos por categoría</p>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map(category => (
              <div key={category.id} onClick={() => handleCategoryClick(category.id)}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.categoryHeader}>
            <button className={styles.backButton} onClick={handleBackToCategories}>
              <ArrowLeft size={20} />
              Volver a Categorías
            </button>
            <div className={styles.categoryInfo}>
              <h1 className={styles.categoryTitle}>{selectedCategory?.nombre}</h1>
              <p className={styles.categoryDescription}>{selectedCategory?.descripcion}</p>
            </div>
          </div>

          <div className={styles.productsSection}>
            <div className={styles.sectionHeader}>
              <Grid size={20} />
              <h2>{filteredProducts.length} Productos</h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay productos en esta categoría</p>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
