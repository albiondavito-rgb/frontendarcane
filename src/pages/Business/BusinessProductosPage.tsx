import { useState, useRef, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProductosPorNegocio, createProducto, updateProducto, deleteProducto, activateProducto } from '../../api/productService';
import { getAllCategories } from '../../api/categoryService';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import styles from './BusinessProductosPage.module.css';
import { Search, Plus, Edit, Trash2, X, Upload, CheckCircle, Loader, Save, List, AlertTriangle, AlertCircle, Package, RotateCcw } from 'react-feather';
import { API_DOMAIN } from '../../api/endpoints';

export const BusinessProductosPage = () => {
    const { negocio, user, flowState } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{type: 'success'|'error'; message: string} | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [processingProductId, setProcessingProductId] = useState<number | null>(null);

    // Estados para los filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockStatusFilter, setStockStatusFilter] = useState('all');
    const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        console.log('=== DEBUG BusinessProductosPage ===');
        console.log('flowState:', flowState);
        console.log('Usuario:', user);
        console.log('Negocio:', negocio);
        console.log('negocio.id:', negocio?.id);
        console.log('negocio.negocioId:', negocio?.negocioId);
        
        // Solo intentar cargar datos si ya está autenticado
        if (flowState === 'AUTENTICADO') {
            loadData();
        }
    }, [negocio, user, flowState]);

    const loadData = async () => {
        // Si flowState no es AUTENTICADO, no hacer nada aún
        if (flowState !== 'AUTENTICADO') {
            console.log('⏳ Esperando autenticación... (flowState:', flowState, ')');
            return;
        }
        
        // Obtener el ID del negocio (puede ser id o negocioId)
        const businessId = negocio?.negocioId || negocio?.id;
        
        // Si está autenticado pero no tiene negocio
        if (!negocio || !businessId) {
            console.log('❌ Usuario autenticado pero sin negocio');
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            console.log('✅ Cargando productos para negocio:', businessId);
            
            const [productsData, categoriesData] = await Promise.all([
                getProductosPorNegocio(businessId),
                getAllCategories()
            ]);
            
            console.log('Productos recibidos:', productsData);
            console.log('Categorías recibidas:', categoriesData);
            
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            showNotification('error', 'Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const openModal = (product: Product | null) => {
        setEditingProduct(product);
        if (product?.imagenUrl) {
            setImagePreview(`${API_DOMAIN}${product.imagenUrl}`);
        } else {
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setImagePreview(null);
        setSavingState('idle');
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target?.result as string);
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleDeleteClick = async (productId: number) => {
        if (confirmingDeleteId === productId) {
            try {
                setProcessingProductId(productId);
                await new Promise(resolve => setTimeout(resolve, 750)); // Demora para UX
                await deleteProducto(productId);
                showNotification('success', 'Producto eliminado exitosamente');
                await loadData();
            } catch (error) {
                console.error('Error al eliminar:', error);
                showNotification('error', 'Error al eliminar el producto');
            } finally {
                setConfirmingDeleteId(null);
                setProcessingProductId(null);
            }
        } else {
            setConfirmingDeleteId(productId);
            setTimeout(() => setConfirmingDeleteId(null), 3000);
        }
    };

    const handleActivateClick = async (productId: number) => {
        if (confirmingDeleteId === productId) {
            try {
                setProcessingProductId(productId);
                await new Promise(resolve => setTimeout(resolve, 750)); // Demora para UX
                await activateProducto(productId);
                showNotification('success', 'Producto reactivado exitosamente');
                await loadData();
            } catch (error) {
                console.error('Error al reactivar:', error);
                showNotification('error', 'Error al reactivar el producto');
            } finally {
                setConfirmingDeleteId(null);
                setProcessingProductId(null);
            }
        } else {
            setConfirmingDeleteId(productId);
            setTimeout(() => setConfirmingDeleteId(null), 3000);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        if (!negocio) return;
        const businessId = negocio.negocioId || negocio.id;
        if (!businessId) return;

        // Asegurarse de que el ID del negocio esté en el FormData
        if (!formData.has('NegocioId')) {
            formData.append('NegocioId', businessId.toString());
        }

        try {
            setSavingState('saving');
            await new Promise(resolve => setTimeout(resolve, 750)); // Demora para UX

            if (editingProduct) {
                // Lógica para ACTUALIZAR un producto
                await updateProducto(editingProduct.id, formData);
                showNotification('success', 'Producto actualizado exitosamente');
                setSavingState('saved');
                setTimeout(() => {
                    closeModal();
                    loadData(); // Recarga la lista DESPUÉS de cerrar el modal
                }, 800);
            } else {
                // Lógica para CREAR un producto
                const newProduct = await createProducto(formData);
                showNotification('success', 'Producto creado exitosamente');
                // Actualización optimista: añadir el nuevo producto al estado sin recargar todo
                setProducts(prevProducts => [newProduct, ...prevProducts]);
                setSavingState('saved');
                setTimeout(closeModal, 800);
            }
        } catch (error) {
            console.error('Error al guardar:', error);
            showNotification('error', error instanceof Error ? error.message : 'Error al guardar el producto');
            setSavingState('idle');
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const nameMatch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase());
            const categoryMatch = categoryFilter === 'all' || product.categoriaId.toString() === categoryFilter;
            
            let stockMatch = true;
            if (stockStatusFilter === 'low') {
                stockMatch = product.cantidadStock > 0 && product.cantidadStock <= 5;
            } else if (stockStatusFilter === 'out') {
                stockMatch = product.cantidadStock === 0;
            }
            
            let activeMatch = true;
            if (activeStatusFilter === 'active') {
                activeMatch = product.estaActivo === true;
            } else if (activeStatusFilter === 'inactive') {
                activeMatch = product.estaActivo === false;
            }
            
            return nameMatch && categoryMatch && stockMatch && activeMatch;
        });
    }, [products, searchQuery, categoryFilter, stockStatusFilter, activeStatusFilter]);

    const statsProducts = useMemo(() => {
        const total = products.length;
        const active = products.filter(p => p.estaActivo).length;
        const inactive = products.filter(p => !p.estaActivo).length;
        const lowStock = products.filter(p => p.estaActivo && p.cantidadStock > 0 && p.cantidadStock <= 5).length;
        const outOfStock = products.filter(p => p.estaActivo && p.cantidadStock === 0).length;
        
        return { total, active, inactive, lowStock, outOfStock };
    }, [products]);

    // Mostrar loading si aún no está autenticado o si está cargando
    if (flowState !== 'AUTENTICADO' || loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
                <p>Cargando información del negocio...</p>
            </div>
        );
    }

    // Si está autenticado pero NO tiene negocio
    if (flowState === 'AUTENTICADO' && !negocio) {
        return (
            <div className={styles.mainGrid}>
                <div className={styles.componentCard}>
                    <div className={styles.emptyState}>
                        <AlertTriangle size={48} color="#f59e0b" />
                        <h3>No tienes un negocio registrado</h3>
                        <p>Para acceder a esta sección, primero debes registrar tu negocio.</p>
                        <p style={{fontSize: '14px', color: 'var(--text-muted)', marginTop: '1rem'}}>
                            Usuario actual: {user?.nombre} {user?.apellido} ({user?.email})
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {notification && (
                <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}
            
            <div className={styles.mainGrid}>
                <div className={styles.componentCard}>
                <div className={styles.componentHeader}>
                    <h2 className={styles.componentTitle}>Gestión de Productos</h2>
                </div>

                <div className={styles.productManagementToolbar}>
                    <div className={styles.searchCreateContainer}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className={styles.searchIcon} size={20} />
                        </div>
                        <button className={styles.createBtn} onClick={() => openModal(null)}>
                            <Plus size={20} />
                            Crear Producto
                        </button>
                    </div>
                    <select
                        className={styles.categoryFilter}
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                {/* Estadísticas de productos */}
                <div className={styles.statsPanel}>
                    <div className={styles.statCard}>
                        <Package size={20} className={styles.statIcon} />
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Total</span>
                            <span className={styles.statValue}>{statsProducts.total}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <CheckCircle size={20} className={styles.statIconSuccess} />
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Activos</span>
                            <span className={styles.statValue}>{statsProducts.active}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <X size={20} className={styles.statIconError} />
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Inactivos</span>
                            <span className={styles.statValue}>{statsProducts.inactive}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <AlertTriangle size={20} className={styles.statIconWarning} />
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Bajo Stock</span>
                            <span className={styles.statValue}>{statsProducts.lowStock}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <AlertCircle size={20} className={styles.statIconDanger} />
                        <div className={styles.statContent}>
                            <span className={styles.statLabel}>Sin Stock</span>
                            <span className={styles.statValue}>{statsProducts.outOfStock}</span>
                        </div>
                    </div>
                </div>

                {/* Sección de filtros de estado agregada */}
                <div className={styles.filters}>
                    <div className={styles.filterSection}>
                        <span className={styles.filterLabel}>Estado:</span>
                        <div className={styles.filterTabs}>
                            <button
                                className={`${styles.filterTab} ${activeStatusFilter === 'all' ? styles.active : ''}`}
                                onClick={() => setActiveStatusFilter('all')}
                            >
                                <List size={16} />Todos
                            </button>
                            <button
                                className={`${styles.filterTab} ${activeStatusFilter === 'active' ? styles.active : ''}`}
                                onClick={() => setActiveStatusFilter('active')}
                            >
                                <CheckCircle size={16} />Activos
                            </button>
                            <button
                                className={`${styles.filterTab} ${activeStatusFilter === 'inactive' ? styles.active : ''}`}
                                onClick={() => setActiveStatusFilter('inactive')}
                            >
                                <X size={16} />Inactivos
                            </button>
                        </div>
                    </div>
                    <div className={styles.filterSection}>
                        <span className={styles.filterLabel}>Stock:</span>
                        <div className={styles.filterTabs}>
                            <button
                                className={`${styles.filterTab} ${stockStatusFilter === 'all' ? styles.active : ''}`}
                                onClick={() => setStockStatusFilter('all')}
                            >
                                <List size={16} />Todos
                            </button>
                            <button
                                className={`${styles.filterTab} ${stockStatusFilter === 'low' ? styles.active : ''}`}
                                onClick={() => setStockStatusFilter('low')}
                            >
                                <AlertTriangle size={16} />Bajo Stock
                            </button>
                            <button
                                className={`${styles.filterTab} ${stockStatusFilter === 'out' ? styles.active : ''}`}
                                onClick={() => setStockStatusFilter('out')}
                            >
                                <AlertCircle size={16} />Fuera de Stock
                            </button>
                        </div>
                    </div>
                </div>

                <div className={styles.productManagementGrid}>
                    {filteredProducts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Package size={48} />
                            {products.length === 0 ? (
                                <>
                                    <h3>No hay productos disponibles</h3>
                                    <p>Comienza agregando productos a tu negocio</p>
                                    <button className={styles.createBtn} onClick={() => openModal(null)}>
                                        <Plus size={20} />
                                        Crear Primer Producto
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3>
                                        {stockStatusFilter === 'low' && 'No hay productos con bajo stock'}
                                        {stockStatusFilter === 'out' && 'No hay productos fuera de stock'}
                                        {stockStatusFilter === 'all' && searchQuery && 'No se encontraron productos'}
                                        {stockStatusFilter === 'all' && !searchQuery && categoryFilter !== 'all' && 'No hay productos en esta categoría'}
                                    </h3>
                                    <p>
                                        {stockStatusFilter === 'low' && 'Todos tus productos tienen stock suficiente'}
                                        {stockStatusFilter === 'out' && '¡Excelente! Todos tus productos están en stock'}
                                        {(searchQuery || categoryFilter !== 'all') && 'Prueba con otros filtros'}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                        <div key={product.id} className={styles.managementProductCard}>
                            <img src={`${API_DOMAIN}${product.imagenUrl}`} alt={product.nombre} className={styles.managementProductImage} />
                            <div className={styles.managementProductInfo}>
                                <h3 className={styles.managementProductTitle}>{product.nombre}</h3>
                                <div className={styles.managementProductDetails}>
                                    <div className={styles.managementProductDetail}>
                                        <span className={styles.detailLabel}>Cantidad:</span>
                                        <span className={styles.detailValue}>{product.cantidadStock}</span>
                                    </div>
                                    <div className={styles.managementProductDetail}>
                                        <span className={styles.detailLabel}>Precio:</span>
                                        <span className={styles.detailValue}>${product.precio.toFixed(2)}</span>
                                    </div>
                                    <div className={styles.managementProductDetail}>
                                        <span className={styles.detailLabel}>Estado:</span>
                                        <span className={`${styles.detailValue} ${product.estaActivo ? styles.statusActive : styles.statusInactive}`}>
                                            {product.estaActivo ? '✅ Activo' : '❌ Inactivo'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.managementProductActions}>
                                    <button className={styles.btnEdit} onClick={() => openModal(product)}>
                                        <Edit size={16} />
                                        Editar
                                    </button>
                                    {product.estaActivo ? (
                                        <button 
                                            className={`${styles.btnDelete} ${confirmingDeleteId === product.id ? styles.confirming : ''} ${processingProductId === product.id ? styles.btnSaving : ''}`}
                                            onClick={() => handleDeleteClick(product.id)}
                                            disabled={processingProductId !== null}
                                        >
                                            {processingProductId === product.id ? (
                                                <><Loader size={16} /> Eliminando...</>
                                            ) : confirmingDeleteId === product.id ? (
                                                <><CheckCircle size={16}/> Confirmar</>
                                            ) : (
                                                <><Trash2 size={16} /> Eliminar</>
                                            )}
                                        </button>
                                    ) : (
                                                                                <button 
                                                                                    className={`${styles.btnActivate} ${confirmingDeleteId === product.id ? styles.confirming : ''} ${processingProductId === product.id ? styles.btnSaving : ''}`}
                                                                                    onClick={() => handleActivateClick(product.id)}
                                                                                    disabled={processingProductId !== null}
                                                                                >
                                                                                    {processingProductId === product.id ? (
                                                                                        <><Loader size={16} /> Reactivando...</>
                                                                                    ) : confirmingDeleteId === product.id ? (
                                                                                        <><CheckCircle size={16} /> Confirmar</>
                                                                                    ) : (
                                                                                        <><RotateCcw size={16} /> Reactivar</>
                                                                                    )}
                                                                                </button>                                    )}
                                </div>
                            </div>
                        </div>
                    )))}
                </div>
            </div>

            {isModalOpen && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
                    <div className={styles.productModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingProduct ? 'Editar' : 'Crear'} Producto</h2>
                            <button className={styles.closeModal} onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <form onSubmit={handleSave}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="Nombre">Nombre del Producto</label>
                                    <input type="text" className={styles.formInput} id="Nombre" name="Nombre" placeholder="Ingresa el nombre del producto" defaultValue={editingProduct?.nombre} required />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="Descripcion">Descripción</label>
                                    <textarea className={styles.formTextarea} id="Descripcion" name="Descripcion" placeholder="Describe el producto..." rows={3} defaultValue={editingProduct?.descripcion}></textarea>
                                </div>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel} htmlFor="Precio">Precio</label>
                                            <input type="number" className={styles.formInput} id="Precio" name="Precio" placeholder="0.00" step="0.01" min="0" defaultValue={editingProduct?.precio} required />
                                        </div>
                                    </div>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel} htmlFor="CantidadStock">Cantidad</label>
                                            <input type="number" className={styles.formInput} id="CantidadStock" name="CantidadStock" placeholder="0" min="0" defaultValue={editingProduct?.cantidadStock} required />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="CategoriaId">Categoría</label>
                                    <select className={styles.formSelect} id="CategoriaId" name="CategoriaId" defaultValue={editingProduct?.categoriaId} required>
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Imagen del Producto</label>
                                    <div className={styles.imageUploadSection}>
                                        <div className={styles.imageUploadContainer}>
                                            {!imagePreview ? (
                                                <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
                                                    <div className={styles.imageUploadIcon}>
                                                        <Upload size={32} />
                                                    </div>
                                                    <div className={styles.imageUploadText}>
                                                        Arrastra una imagen aquí o haz clic para seleccionar
                                                    </div>
                                                    <button type="button" className={styles.imageUploadBtn}>
                                                        Seleccionar Imagen
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={styles.imagePreviewContainer}>
                                                    <img src={imagePreview} className={styles.previewImage} alt="Vista previa" />
                                                    <div className={styles.previewActions}>
                                                        <button type="button" className={styles.btnChangeImage} onClick={() => fileInputRef.current?.click()}>
                                                            Cambiar Imagen
                                                        </button>
                                                        <button type="button" className={styles.btnRemoveImage} onClick={() => setImagePreview(null)}>
                                                            Quitar Imagen
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <input type="file" ref={fileInputRef} name="Imagen" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} required={!editingProduct} />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Campo oculto para mantener el estado activo del producto */}
                                <input type="hidden" name="EstaActivo" value="true" />
                                
                                <div className={styles.modalFooter}>
                                    <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={savingState !== 'idle'}>Cancelar</button>
                                    <button 
                                        type="submit"
                                        className={`${styles.btnSave} ${savingState === 'saving' ? styles.btnSaving : ''} ${savingState === 'saved' ? styles.btnSaved : ''}`}
                                        disabled={savingState !== 'idle'}
                                    >
                                        {savingState === 'idle' && <><Save size={18} /> Guardar Producto</>}
                                        {savingState === 'saving' && <><Loader size={18} /> Guardando...</>}
                                        {savingState === 'saved' && <><CheckCircle size={18} /> ¡Guardado!</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};
