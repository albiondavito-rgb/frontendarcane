import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductosPorNegocio } from '../../api/productService';
import { getResenasPorProducto } from '../../api/resenaService';
import { API_DOMAIN } from '../../api/endpoints';
import styles from './BusinessResenasPage.module.css';
import { ArrowRight, ChevronDown, ChevronUp, Search, Loader } from 'react-feather';
import type { ResenaDto } from '../../types/resena.types';
import type { Product } from '../../types/product';
import { ProductModal } from '../../components/products/ProductModal';

type ProductWithReviews = Product & {
    reviews: ResenaDto[];
};

export const BusinessResenasPage = () => {
    const { negocio } = useAuth();
    const [reviewsData, setReviewsData] = useState<ProductWithReviews[]>([]);
    const [loading, setLoading] = useState(true);
    const [nameFilter, setNameFilter] = useState('');
    const [catFilter, setCatFilter] = useState('Todas las categorías');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadProductsWithReviews();
    }, [negocio]);

    const loadProductsWithReviews = async () => {
        if (!negocio) return;
        const businessId = negocio.negocioId || negocio.id;
        if (!businessId) return;

        try {
            setLoading(true);
            const products = await getProductosPorNegocio(businessId);

            const productsWithReviewsData = await Promise.all(
                products.map(async (product) => {
                    try {
                        const reviews = await getResenasPorProducto(product.id);
                        return { ...product, reviews };
                    } catch {
                        return { ...product, reviews: [] };
                    }
                })
            );

            setReviewsData(productsWithReviewsData);
        } catch (error) {
            console.error('Error al cargar productos con reseñas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const categories = useMemo(() => [
        'Todas las categorías', 
        ...new Set(reviewsData.map(p => p.nombreCategoria || 'Sin categoría'))
    ], [reviewsData]);

    const ratingOptions = [
        { value: 0, label: 'Cualquier calificación' },
        { value: 5, label: '★★★★★ (5)' },
        { value: 4, label: '★★★★☆ (4+)' },
        { value: 3, label: '★★★☆☆ (3+)' },
        { value: 2, label: '★★☆☆☆ (2+)' },
        { value: 1, label: '★☆☆☆☆ (1+)' },
    ];

    const filteredProducts = useMemo(() => {
        return reviewsData.filter(p => {
            const totalReviews = p.reviews.length;
            if (totalReviews === 0) return false;

            const averageRating = p.reviews.reduce((sum, r) => sum + r.calificacion, 0) / totalReviews;

            const nameMatch = p.nombre.toLowerCase().includes(nameFilter.toLowerCase());
            const catMatch = catFilter === 'Todas las categorías' || (p.nombreCategoria || 'Sin categoría') === catFilter;
            const ratingMatch = ratingFilter === 0 || averageRating >= ratingFilter;
            
            return nameMatch && catMatch && ratingMatch;
        });
    }, [reviewsData, nameFilter, catFilter, ratingFilter]);

    const toggleComments = (productId: number) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
                <p>Cargando productos y reseñas...</p>
            </div>
        );
    }

    return (
        <div className={styles.mainGrid}>
            <h1 className={styles.sectionTitle}>Reseñas de Productos</h1>

            <div className={styles.filters}>
                <input 
                    id="nameFilter" 
                    className={styles.formInput} 
                    placeholder="Buscar por nombre de producto..." 
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                />
                <select 
                    id="catFilter" 
                    className={styles.formSelect}
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    id="ratingFilter" 
                    className={styles.formSelect}
                    value={ratingFilter}
                    onChange={e => setRatingFilter(Number(e.target.value))}
                >
                    {ratingOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
            </div>

            <div className={styles.reviewsGrid} id="reviewsGrid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => {
                        const totalReviews = p.reviews.length;
                        const averageRating = (p.reviews.reduce((sum, r) => sum + r.calificacion, 0) / totalReviews).toFixed(1);
                        const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                        p.reviews.forEach(r => ratingCounts[r.calificacion]++);
                        const isExpanded = expandedComments.has(p.id);

                        return (
                            <div key={p.id} className={styles.reviewCard}>
                                <div className={styles.productSummary}>
                                    <img src={`${API_DOMAIN}${p.imagenUrl}`} alt={p.nombre} className={styles.productImage} loading="lazy" />
                                    <div className={styles.productInfo}>
                                        <div>
                                            <div className={styles.productCategory}>{p.nombreCategoria}</div>
                                            <h3 className={styles.productName}>{p.nombre}</h3>
                                        </div>
                                        <button onClick={() => handleOpenModal(p)} className={styles.btnLink}>
                                            Ver Producto <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.ratingSummary}>
                                    <div className={styles.averageRating}>
                                        <div className={styles.averageValue}>{averageRating}</div>
                                        <div className={styles.starRating}>
                                            {'★'.repeat(Math.round(parseFloat(averageRating)))}{'☆'.repeat(5 - Math.round(parseFloat(averageRating)))}
                                        </div>
                                        <div className={styles.totalReviews}>Basado en {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}</div>
                                    </div>
                                    <div className={styles.ratingBreakdown}>
                                        {[5, 4, 3, 2, 1].map(i => (
                                            <div key={i} className={styles.breakdownRow}>
                                                <div className={styles.breakdownLabel}>{i} estrella{i !== 1 ? 's' : ''}</div>
                                                <div className={styles.progressBar}>
                                                    <div className={styles.progress} style={{ width: `${(ratingCounts[i] / totalReviews) * 100}%` }}></div>
                                                </div>
                                                <div className={styles.breakdownCount}>{ratingCounts[i]}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.commentsSection}>
                                    <button className={styles.toggleComments} onClick={() => toggleComments(p.id)}>
                                        <span>{isExpanded ? 'Ocultar' : 'Mostrar'} {totalReviews} comentario{totalReviews !== 1 ? 's' : ''}</span>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    <div className={styles.commentsList} style={{ display: isExpanded ? 'flex' : 'none' }}>
                                        {p.reviews.map((r, index) => (
                                            <div key={index} className={styles.comment}>
                                                <div className={styles.commentHeader}>
                                                    <div className={styles.commentAuthor}>{r.nombreUsuario}</div>
                                                    <div className={styles.starRating}>
                                                        {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                                                    </div>
                                                </div>
                                                <p className={styles.commentBody}>{r.comentario}</p>
                                                <div className={styles.commentDate}>{new Date(r.fechaResena).toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className={styles.noResults}>
                        <Search size={64} />
                        <h3>No se encontraron productos</h3>
                        <p>Intenta ajustar los filtros para ver más resultados</p>
                    </div>
                )}
            </div>
            
            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};