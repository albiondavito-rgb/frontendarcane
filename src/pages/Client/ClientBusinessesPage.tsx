import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BusinessCard } from '../../components/businesses/BusinessCard';
import { ProductCard } from '../../components/products/ProductCard';
import { getAllBusinesses } from '../../api/businessService';
import { getAllProducts } from '../../api/productService';
import type { Business } from '../../types/negocio';
import type { Product } from '../../types/product';
import styles from './ClientBusinessesPage.module.css';
import { ArrowLeft, MapPin, Phone, Mail, Package } from 'react-feather';
import { API_DOMAIN } from '../../api/endpoints';

export const ClientBusinessesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const businessId = searchParams.get('negocio');
    if (businessId) {
      setSelectedBusinessId(Number(businessId));
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [businessesData, productsData] = await Promise.all([
        getAllBusinesses(),
        getAllProducts(),
      ]);
      setBusinesses(businessesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessClick = (businessId: number) => {
    setSelectedBusinessId(businessId);
    setSearchParams({ negocio: businessId.toString() });
  };

  const handleBackToBusinesses = () => {
    setSelectedBusinessId(null);
    setSearchParams({});
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const businessProducts = selectedBusinessId
    ? products.filter(p => p.negocioId === selectedBusinessId)
    : [];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando negocios...</p>
      </div>
    );
  }

  return (
    <div className={styles.businessesPage}>
      {!selectedBusinessId ? (
        <>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Negocios</h1>
            <p className={styles.pageSubtitle}>Descubre todos nuestros negocios asociados</p>
          </div>

          <div className={styles.businessesGrid}>
            {businesses.map(business => (
              <div key={business.id} onClick={() => handleBusinessClick(business.id)}>
                <BusinessCard business={business} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.businessDetailHeader}>
            <button className={styles.backButton} onClick={handleBackToBusinesses}>
              <ArrowLeft size={20} />
              Volver a Negocios
            </button>
          </div>

          {selectedBusiness && (
            <div className={styles.businessProfile}>
              <div className={styles.businessBanner}>
                {selectedBusiness.imagenUrl && (
                  <img
                    src={`${API_DOMAIN}${selectedBusiness.imagenUrl}`}
                    alt={selectedBusiness.nombre}
                    className={styles.businessImage}
                  />
                )}
              </div>

              <div className={styles.businessInfo}>
                <div className={styles.businessHeader}>
                  <h1 className={styles.businessName}>{selectedBusiness.nombre}</h1>
                  {selectedBusiness.estado && (
                    <span className={`${styles.businessStatus} ${styles[selectedBusiness.estado.toLowerCase()]}`}>
                      {selectedBusiness.estado}
                    </span>
                  )}
                </div>

                {selectedBusiness.descripcion && (
                  <p className={styles.businessDescription}>{selectedBusiness.descripcion}</p>
                )}

                <div className={styles.businessDetails}>
                  {selectedBusiness.direccion && (
                    <div className={styles.detailItem}>
                      <MapPin size={18} />
                      <span>{selectedBusiness.direccion}</span>
                    </div>
                  )}
                  {selectedBusiness.telefono && (
                    <div className={styles.detailItem}>
                      <Phone size={18} />
                      <span>{selectedBusiness.telefono}</span>
                    </div>
                  )}
                  {selectedBusiness.email && (
                    <div className={styles.detailItem}>
                      <Mail size={18} />
                      <span>{selectedBusiness.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={styles.productsSection}>
            <div className={styles.sectionHeader}>
              <Package size={24} />
              <h2>Productos de {selectedBusiness?.nombre}</h2>
            </div>

            {businessProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={64} className={styles.emptyIcon} />
                <p>Este negocio aún no tiene productos disponibles</p>
              </div>
            ) : (
              <>
                <div className={styles.productsCount}>
                  {businessProducts.length} productos disponibles
                </div>
                <div className={styles.productsGrid}>
                  {businessProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
