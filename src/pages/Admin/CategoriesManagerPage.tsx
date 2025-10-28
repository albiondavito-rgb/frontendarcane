import React, { useState, useEffect, useRef } from 'react';
import styles from './CategoriesManagerPage.module.css';
import { Search, Plus, Edit, Trash2, X, Upload, CheckCircle, Loader } from 'react-feather';
import { getAllAdminCategories, createCategory, updateCategory, deleteCategory, activateCategory } from '../../api/categoryService';
import { API_DOMAIN } from '../../api/endpoints';
import type { AdminCategory, CategoryCreateDto, CategoryUpdateDto } from '../../types/admin.types';

type Category = AdminCategory;

const CategoriesManagerPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [confirmingActivateId, setConfirmingActivateId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null); // Nuevo estado para animación
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ name?: string; image?: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await getAllAdminCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.nombre);
      // Para vista previa al editar, usamos la URL completa del backend
      setCategoryImage(`${API_DOMAIN}${editingCategory.imagenUrl}`);
      setSelectedFile(null);
    } else {
      setCategoryName('');
      setCategoryImage(null);
      setSelectedFile(null);
    }
  }, [editingCategory]);

  const openModal = (category: Category | null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSavingState('idle');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCategoryImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setValidationErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleSaveCategory = async () => {
    // Validaciones
    const newErrors: { name?: string; image?: string } = {};
    if (!categoryName) newErrors.name = 'El nombre de la categoría es obligatorio.';
    if (!editingCategory && !selectedFile) newErrors.image = 'La imagen es obligatoria para nuevas categorías.';
    setValidationErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSavingState('saving');
    try {
      if (editingCategory) {
        // Actualizar categoría existente
        const updateData: CategoryUpdateDto = {
          nombre: categoryName,
          imagen: selectedFile || undefined
        };
        const updatedCategory = await updateCategory(editingCategory.id, updateData);
        setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
      } else {
        // Crear nueva categoría
        const createData: CategoryCreateDto = {
          nombre: categoryName,
          imagen: selectedFile as File
        };
        const newCategory = await createCategory(createData);
        setCategories([newCategory, ...categories]);
      }
      setSavingState('saved');
      setNotification({ type: 'success', message: editingCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente' });
      setTimeout(() => setNotification(null), 3000);
      setTimeout(() => { closeModal(); }, 800);
    } catch (err) {
      setSavingState('idle');
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar categoría';
      setNotification({ type: 'error', message: errorMessage });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (confirmingDeleteId === categoryId) {
      setProcessingId(categoryId); // Iniciar animación
      try {
        // Agregar demora para UX como en BusinessProductosPage
        await new Promise(resolve => setTimeout(resolve, 750));
        await deleteCategory(parseInt(categoryId));
        await loadCategories(); // Recargar para ver el cambio de estado
        setNotification({ type: 'success', message: 'Categoría deshabilitada exitosamente' });
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al deshabilitar categoría' });
        setTimeout(() => setNotification(null), 4000);
      } finally {
        setProcessingId(null);
        setConfirmingDeleteId(null);
      }
    } else {
      setConfirmingDeleteId(categoryId);
      setTimeout(() => {
        setConfirmingDeleteId(currentId => (currentId === categoryId ? null : currentId));
      }, 3000);
    }
  };

  const handleActivateClick = async (categoryId: string) => {
    if (confirmingActivateId === categoryId) {
      setProcessingId(categoryId); // Iniciar animación
      try {
        // Agregar demora para UX como en BusinessProductosPage
        await new Promise(resolve => setTimeout(resolve, 750));
        await activateCategory(parseInt(categoryId));
        await loadCategories(); // Recargar para ver el cambio de estado
        setNotification({ type: 'success', message: 'Categoría activada exitosamente' });
        setTimeout(() => setNotification(null), 3000);
      } catch (err) {
        setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al activar categoría' });
        setTimeout(() => setNotification(null), 4000);
      } finally {
        setProcessingId(null);
        setConfirmingActivateId(null);
      }
    } else {
      setConfirmingActivateId(categoryId);
      setTimeout(() => {
        setConfirmingActivateId(currentId => (currentId === categoryId ? null : currentId));
      }, 3000);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.mainGrid}>
        <div className={styles.mainContentArea}>
          <div className={styles.componentCard}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader size={32} className={styles.loadingSpinner} />
              <p>Cargando categorías...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainGrid}>
        <div className={styles.mainContentArea}>
          <div className={styles.componentCard}>
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
              <p>Error: {error}</p>
              <button onClick={loadCategories}>Reintentar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainGrid}>
      <div className={styles.mainContentArea}>
        <div className={styles.componentCard}>
          <div className={styles.componentHeader}>
            <h2 className={styles.componentTitle}>Gestión de Categorías</h2>
          </div>
          {notification && (
            <div className={`${styles.notice} ${notification.type === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
              {notification.message}
            </div>
          )}
          
          <div className={styles.categoryManagementToolbar}>
            <div className={styles.searchCreateContainer}>
              <div className={styles.searchBar}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Buscar categorías..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className={styles.searchIcon} size={20} />
              </div>
              <button className={styles.createBtn} onClick={() => openModal(null)}>
                <Plus size={20} />
                Crear Categoría
              </button>
            </div>
          </div>
          
          <div className={styles.categoryManagementGrid}>
            {filteredCategories.map((category) => (
              <div key={category.id} className={`${styles.managementCategoryCard} ${!category.estaActiva ? styles.inactiveCard : ''}`}>
                <img src={`${API_DOMAIN}${category.imagenUrl}`} alt={category.nombre} className={styles.managementCategoryImage} />
                <div className={styles.managementCategoryInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 className={styles.managementCategoryTitle}>{category.nombre}</h3>
                    <span className={`${styles.statusBadge} ${category.estaActiva ? styles.statusActive : styles.statusInactive}`}>
                      {category.estaActiva ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className={styles.managementCategoryActions}>
                    <button className={styles.btnEdit} data-id={category.id} onClick={() => openModal(category)}>
                      <Edit size={16} />
                      Editar
                    </button>
                    {category.estaActiva ? (
                      <button 
                        className={`${styles.btnDelete} ${confirmingDeleteId === category.id.toString() ? styles.confirming : ''} ${processingId === category.id.toString() ? styles.btnSaving : ''}`} 
                        data-id={category.id}
                        onClick={() => handleDeleteClick(category.id.toString())}
                        disabled={processingId !== null}
                      >
                        {processingId === category.id.toString() ? (
                          <><Loader size={16} className={styles.spinnerIcon} /> Deshabilitando...</>
                        ) : confirmingDeleteId === category.id.toString() ? (
                          <><CheckCircle size={16} /> Confirmar</>
                        ) : (
                          <><Trash2 size={16} /> Deshabilitar</>
                        )}
                      </button>
                    ) : (
                      <button 
                        className={`${styles.btnActivate} ${confirmingActivateId === category.id.toString() ? styles.confirming : ''} ${processingId === category.id.toString() ? styles.btnSaving : ''}`} 
                        data-id={category.id}
                        onClick={() => handleActivateClick(category.id.toString())}
                        disabled={processingId !== null}
                      >
                        {processingId === category.id.toString() ? (
                          <><Loader size={16} className={styles.spinnerIcon} /> Activando...</>
                        ) : confirmingActivateId === category.id.toString() ? (
                          <><CheckCircle size={16} /> Confirmar</>
                        ) : (
                          <><CheckCircle size={16} /> Activar</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal para crear/editar categoría */}
          {isModalOpen && (
            <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
              <div className={styles.categoryModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>{editingCategory ? 'Editar' : 'Crear'} Categoría</h2>
                  <button className={styles.closeModal} onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className={styles.modalBody}>
                  <form>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="categoryName">Nombre de la Categoría</label>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        placeholder="Ingresa el nombre de la categoría" 
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required 
                      />
                      {validationErrors.name && <div className={styles.errorText}>{validationErrors.name}</div>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Imagen de la Categoría</label>
                      <div className={styles.imageUploadSection}>
                        <div className={styles.imageUploadContainer}>
                          {!categoryImage ? (
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
                              <img src={categoryImage} className={styles.previewImage} alt="Vista previa" />
                              <div className={styles.previewActions}>
                                <button type="button" className={styles.btnChangeImage} onClick={() => fileInputRef.current?.click()}>
                                  Cambiar Imagen
                                </button>
                                <button type="button" className={styles.btnRemoveImage} onClick={() => {
                                  setCategoryImage(null);
                                  setSelectedFile(null);
                                }}>
                                  Quitar Imagen
                                </button>
                              </div>
                            </div>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                          />
                          {validationErrors.image && <div className={styles.errorText} style={{ marginTop: '0.5rem' }}>{validationErrors.image}</div>}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className={styles.modalFooter}>
                  <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
                  <button 
                    className={`${styles.btnSave} ${savingState === 'saving' ? styles.btnSaving : ''} ${savingState === 'saved' ? styles.btnSaved : ''}`}
                    onClick={handleSaveCategory}
                    disabled={savingState !== 'idle'}
                  >
                    {savingState === 'idle' && 'Guardar Categoría'}
                    {savingState === 'saving' && <><Loader size={18} className={styles.spinnerIcon} /> Guardando...</>}
                    {savingState === 'saved' && '¡Guardado!'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CategoriesManagerPage;