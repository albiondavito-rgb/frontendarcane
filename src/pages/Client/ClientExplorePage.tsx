import { useState, useEffect } from 'react';
import { ProductCard } from '../../components/products/ProductCard';
import { getAllProducts } from '../../api/productService';
import { getAllCategories } from '../../api/categoryService';
import { getAllBusinesses } from '../../api/businessService';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import type { Business } from '../../types/negocio';
import styles from './ClientExplorePage.module.css';
import { Search, ChevronLeft, ChevronRight, Package, Grid, ShoppingBag, MapPin, Phone, Calendar, FileText } from 'react-feather';
import { useSearchParams } from 'react-router-dom';
import { API_DOMAIN } from '../../api/endpoints';

type FilterTab = 'productos' | 'categorias' | 'negocios';

export const ClientExplorePage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<FilterTab>('productos');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para productos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | ''>('');
  
  // Estado para filtro de categoría en sección de negocios
  const [businessCategoryFilter, setBusinessCategoryFilter] = useState<number | null>(null);
  
  // Estados para navegación de categorías
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  
  // Estados para navegación de negocios
  const [currentBusinessIndex, setCurrentBusinessIndex] = useState(0);
  const [businessInfoExpanded, setBusinessInfoExpanded] = useState(false);
  
  // Estados para paginación de productos
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBusiness, sortBy, activeTab, currentCategoryIndex, currentBusinessIndex, businessCategoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, businessesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllBusinesses(),
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setBusinesses(businessesData);

      // Procesar parámetros de URL aquí, antes de que loading sea false
      const initialTab = searchParams.get('tab');
      const initialId = searchParams.get('id');
      const initialSearch = searchParams.get('q');

      if (initialSearch) {
        setSearchTerm(initialSearch);
      }

      if (initialTab && initialId) {
        if (initialTab === 'categorias' && categoriesData.length > 0) {
          const categoryIndex = categoriesData.findIndex(c => c.id === Number(initialId));
          if (categoryIndex !== -1) {
            setActiveTab('categorias');
            setCurrentCategoryIndex(categoryIndex);
          }
        } else if (initialTab === 'negocios' && businessesData.length > 0) {
          const businessIndex = businessesData.findIndex(b => b.id === Number(initialId));
          if (businessIndex !== -1) {
            setActiveTab('negocios');
            setCurrentBusinessIndex(businessIndex);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de productos
  const filteredProducts = products
    .filter(product => product.estaActivo) // ✅ Solo productos activos en Explorar
    .filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeTab === 'categorias' 
        ? product.categoriaId === categories[currentCategoryIndex]?.id
        : activeTab === 'negocios'
        ? businessCategoryFilter === null || product.categoriaId === businessCategoryFilter
        : selectedCategory === null || product.categoriaId === selectedCategory;
      const matchesBusiness = activeTab === 'negocios'
        ? product.negocioId === businesses[currentBusinessIndex]?.id
        : selectedBusiness === null || product.negocioId === selectedBusiness;
      return matchesSearch && matchesCategory && matchesBusiness;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.precio - b.precio;
      if (sortBy === 'price-desc') return b.precio - a.precio;
      return 0;
    });

  const handlePrevCategory = () => {
    setCurrentCategoryIndex(prev => (prev === 0 ? categories.length - 1 : prev - 1));
  };

  const handleNextCategory = () => {
    setCurrentCategoryIndex(prev => (prev === categories.length - 1 ? 0 : prev + 1));
  };

  const handlePrevBusiness = () => {
    setCurrentBusinessIndex(prev => (prev === 0 ? businesses.length - 1 : prev - 1));
    setBusinessInfoExpanded(false);
    setBusinessCategoryFilter(null);
    setSearchTerm('');
  };

  const handleNextBusiness = () => {
    setCurrentBusinessIndex(prev => (prev === businesses.length - 1 ? 0 : prev + 1));
    setBusinessInfoExpanded(false);
    setBusinessCategoryFilter(null);
    setSearchTerm('');
  };

  // Funciones de paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const currentBusiness = businesses[currentBusinessIndex];
  const currentCategory = categories[currentCategoryIndex];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className={styles.explorePage}>
      {/* Tabs de navegación */}
      <div className={styles.navigationFilters}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${activeTab === 'productos' ? styles.active : ''}`}
            onClick={() => setActiveTab('productos')}
          >
            <Package size={20} />
            Productos
          </button>
          <button
            className={`${styles.filterTab} ${activeTab === 'categorias' ? styles.active : ''}`}
            onClick={() => setActiveTab('categorias')}
          >
            <Grid size={20} />
            Categorías
          </button>
          <button
            className={`${styles.filterTab} ${activeTab === 'negocios' ? styles.active : ''}`}
            onClick={() => setActiveTab('negocios')}
          >
            <ShoppingBag size={20} />
            Negocios
          </button>
        </div>
      </div>

      {/* Sección de Productos */}
      {activeTab === 'productos' && (
        <div className={styles.componentCard}>
          <div className={styles.componentHeader}>
            <h2 className={styles.componentTitle}>Explorar Productos</h2>
          </div>

          <div className={styles.productsControls}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.sortBox}>
              <select
                className={styles.sortSelect}
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div className={styles.sortBox}>
              <select
                className={styles.sortSelect}
                value={selectedBusiness || ''}
                onChange={(e) => setSelectedBusiness(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Todos los negocios</option>
                {businesses.map(bus => (
                  <option key={bus.id} value={bus.id}>{bus.nombre}</option>
                ))}
              </select>
            </div>
            <div className={styles.sortBox}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="">Ordenar por precio</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          {filteredProducts.length > 0 && (
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </span>
            </div>
          )}

          <div className={styles.productsGrid}>
            {filteredProducts.length === 0 ? (
              <div className={styles.noResults}>
                <Package size={64} className={styles.noResultsIcon} />
                <p className={styles.noResultsText}>No se encontraron productos</p>
              </div>
            ) : (
              paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              
              <div className={styles.paginationNumbers}>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sección de Categorías */}
      {activeTab === 'categorias' && (
        <div className={styles.componentCard}>
          <div className={styles.componentHeader}>
            <h2 className={styles.componentTitle}>Productos por Categorías</h2>
          </div>

          <div className={styles.categoryHeader}>
            <button className={styles.navArrow} onClick={handlePrevCategory}>
              <ChevronLeft size={24} />
            </button>
            <h3 className={styles.categoryTitle}>
              {currentCategory?.nombre || 'Categoría'}
            </h3>
            <button className={styles.navArrow} onClick={handleNextCategory}>
              <ChevronRight size={24} />
            </button>
          </div>

          <div className={styles.productsControls}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.sortBox}>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="">Ordenar por precio</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          {filteredProducts.length > 0 && (
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </span>
            </div>
          )}

          <div className={styles.productsGrid}>
            {filteredProducts.length === 0 ? (
              <div className={styles.noResults}>
                <Package size={64} className={styles.noResultsIcon} />
                <p className={styles.noResultsText}>No hay productos en esta categoría</p>
              </div>
            ) : (
              paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              
              <div className={styles.paginationNumbers}>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sección de Negocios */}
      {activeTab === 'negocios' && currentBusiness && (
        <div className={styles.componentCard}>
          <div className={styles.componentHeader}>
            <h2 className={styles.componentTitle}>Explorar Negocios</h2>
          </div>

          <div className={styles.businessNavigation}>
            <button className={styles.navArrow} onClick={handlePrevBusiness}>
              <ChevronLeft size={24} />
            </button>
            <h3 className={styles.businessTitle}>{currentBusiness.nombre}</h3>
            <button className={styles.navArrow} onClick={handleNextBusiness}>
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Perfil compacto del negocio */}
          <div 
            className={styles.profileHeaderCompact}
            onClick={() => setBusinessInfoExpanded(!businessInfoExpanded)}
          >
            <div className={styles.profileBannerCompact}>
              {currentBusiness.imagenBannerUrl && (
                <img 
                  src={`${API_DOMAIN}${currentBusiness.imagenBannerUrl}`} 
                  alt={`Banner de ${currentBusiness.nombre}`}
                />
              )}
            </div>
            <div className={styles.profileAvatarCompact}>
              <div className={styles.profileAvatarImgCompact}>
                <img 
                  src={`${API_DOMAIN}${currentBusiness.imagenPerfilUrl}`} 
                  alt={currentBusiness.nombre}
                />
              </div>
            </div>
            <h1 className={styles.profileNameCompact}>{currentBusiness.nombre}</h1>
          </div>

          {/* Información expandible */}
          <div className={`${styles.profileExpandableInfo} ${businessInfoExpanded ? styles.expanded : ''}`}>
            <div className={styles.profileDetailsExpanded}>
              {currentBusiness.direccion && (
                <div className={styles.profileDetailExpanded}>
                  <MapPin size={18} />
                  <div>
                    <strong>Ubicación:</strong>
                    <span>{currentBusiness.direccion}</span>
                  </div>
                </div>
              )}
              {currentBusiness.telefono && (
                <div className={styles.profileDetailExpanded}>
                  <Phone size={18} />
                  <div>
                    <strong>Teléfono:</strong>
                    <span>{currentBusiness.telefono}</span>
                  </div>
                </div>
              )}
              {currentBusiness.fechaRegistro && (
                <div className={styles.profileDetailExpanded}>
                  <Calendar size={18} />
                  <div>
                    <strong>Fecha de Registro:</strong>
                    <span>{new Date(currentBusiness.fechaRegistro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              )}
              {currentBusiness.descripcion && (
                <div className={`${styles.profileDetailExpanded} ${styles.fullWidth}`}>
                  <FileText size={18} />
                  <div>
                    <strong>Descripción:</strong>
                    <span>{currentBusiness.descripcion}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Productos del negocio */}
          <div className={styles.productsControls}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className={styles.sortBox}>
              <select
                className={styles.sortSelect}
                value={businessCategoryFilter || ''}
                onChange={(e) => setBusinessCategoryFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Todas las categorías</option>
                {categories
                  .filter(cat => filteredProducts.some(p => p.categoriaId === cat.id && p.negocioId === currentBusiness.id))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          {filteredProducts.length > 0 && (
            <div className={styles.resultsInfo}>
              <span className={styles.resultsCount}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
              </span>
            </div>
          )}

          <div className={styles.productsGrid}>
            {filteredProducts.length === 0 ? (
              <div className={styles.noResults}>
                <Package size={64} className={styles.noResultsIcon} />
                <p className={styles.noResultsText}>Este negocio no tiene productos disponibles</p>
              </div>
            ) : (
              paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              
              <div className={styles.paginationNumbers}>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => handlePageChange(page as number)}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button
                className={styles.paginationButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
