import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateNegocio } from '../../api/businessService';
import { API_DOMAIN } from '../../api/endpoints';
import styles from './BusinessConfiguracionPage.module.css';
import { Save, X, CheckCircle, Loader, Image as ImageIcon, Camera, MapPin, Phone, Calendar, Info, UploadCloud } from 'react-feather';

export const BusinessConfiguracionPage = () => {
    const { negocio, refreshUserData } = useAuth();
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [notification, setNotification] = useState<{type: 'success'|'error'; message: string} | null>(null);
    
    // Modales
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    
    // File inputs
    const avatarFileRef = useRef<HTMLInputElement>(null);
    const bannerFileRef = useRef<HTMLInputElement>(null);
    
    // Temp files for upload
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [tempAvatarPreview, setTempAvatarPreview] = useState<string | null>(null);
    const [tempBannerPreview, setTempBannerPreview] = useState<string | null>(null);

    useEffect(() => {
        if (negocio?.imagenPerfilUrl) {
            setAvatarPreview(`${API_DOMAIN}${negocio.imagenPerfilUrl}`);
        }
        if (negocio?.imagenBannerUrl) {
            setBannerPreview(`${API_DOMAIN}${negocio.imagenBannerUrl}`);
        }
    }, [negocio]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAvatar = () => {
        if (tempAvatarPreview) {
            setAvatarPreview(tempAvatarPreview);
        }
        setIsAvatarModalOpen(false);
    };

    const handleSaveBanner = () => {
        if (tempBannerPreview) {
            setBannerPreview(tempBannerPreview);
        }
        setIsBannerModalOpen(false);
    };

    const handleCancelAvatar = () => {
        setTempAvatarPreview(null);
        setAvatarFile(null);
        if (avatarFileRef.current) avatarFileRef.current.value = '';
        setIsAvatarModalOpen(false);
    };

    const handleCancelBanner = () => {
        setTempBannerPreview(null);
        setBannerFile(null);
        if (bannerFileRef.current) bannerFileRef.current.value = '';
        setIsBannerModalOpen(false);
    };

    const handleRemoveAvatarPreview = () => {
        setTempAvatarPreview(null);
        setAvatarFile(null);
        if (avatarFileRef.current) avatarFileRef.current.value = '';
    };

    const handleRemoveBannerPreview = () => {
        setTempBannerPreview(null);
        setBannerFile(null);
        if (bannerFileRef.current) bannerFileRef.current.value = '';
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!negocio) return;
        const businessId = negocio.negocioId || negocio.id;
        if (!businessId) return;

        const formData = new FormData(e.currentTarget);
        
        // Agregar archivos de imagen si fueron seleccionados
        if (avatarFile) {
            formData.append('ImagenPerfil', avatarFile);
        }
        if (bannerFile) {
            formData.append('ImagenBanner', bannerFile);
        }

        try {
            setSavingState('saving');
            await updateNegocio(businessId, formData);
            await refreshUserData(); // Recargar datos del negocio
            showNotification('success', 'Negocio actualizado exitosamente');
            setSavingState('saved');
            
            // Limpiar archivos temporales
            setAvatarFile(null);
            setBannerFile(null);
            setTempAvatarPreview(null);
            setTempBannerPreview(null);
            
            setTimeout(() => {
                setSavingState('idle');
            }, 1500);
        } catch (error) {
            console.error('Error al actualizar negocio:', error);
            showNotification('error', 'Error al actualizar el negocio');
            setSavingState('idle');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (!negocio) {
        return (
            <div className={styles.loadingContainer}>
                <Loader size={40} className={styles.spinner} />
                <p>Cargando información del negocio...</p>
            </div>
        );
    }

    return (
        <div className={styles.configContainer}>
            {notification && (
                <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Profile Header Section - Estilo Facebook */}
            <div className={styles.profileHeader}>
                <div className={styles.profileBanner}>
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner del negocio" className={styles.bannerImage} />
                    ) : (
                        <div className={styles.emptyBanner}>
                            <ImageIcon size={64} />
                            <p>Sin banner</p>
                        </div>
                    )}
                    <div className={styles.profileBannerOverlay}>
                        <button 
                            type="button"
                            className={styles.changeBannerBtn} 
                            onClick={() => setIsBannerModalOpen(true)}
                        >
                            <Camera size={20} />
                            Cambiar Banner
                        </button>
                    </div>
                </div>
                
                <div className={styles.profileAvatarContainer}>
                    <div className={styles.profileAvatar}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Logo del negocio" />
                        ) : (
                            <div className={styles.emptyAvatar}>
                                <ImageIcon size={48} />
                            </div>
                        )}
                        <div className={styles.profileAvatarOverlay}>
                            <button 
                                type="button"
                                className={styles.changeAvatarBtn} 
                                onClick={() => setIsAvatarModalOpen(true)}
                            >
                                <Camera size={16} />
                                Cambiar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className={styles.profileInfoHeader}>
                    <h1 className={styles.profileName}>{negocio.nombre}</h1>
                    
                    <div className={styles.profileDetails}>
                        <div className={styles.profileDetail}>
                            <MapPin size={18} />
                            <span>{negocio.ubicacion || negocio.direccion || 'Ubicación no especificada'}</span>
                        </div>
                        <div className={styles.profileDetail}>
                            <Phone size={18} />
                            <span>{negocio.telefonoNegocio || negocio.telefono || 'Teléfono no especificado'}</span>
                        </div>
                        <div className={styles.profileDetail}>
                            <Calendar size={18} />
                            <span>Creado el {negocio.fechaCreacion ? formatDate(negocio.fechaCreacion) : 'Fecha no disponible'}</span>
                        </div>
                    </div>
                    
                    {(negocio.detalles || negocio.descripcion) && (
                        <div className={styles.profileDetail} style={{ marginTop: '0.5rem' }}>
                            <Info size={18} />
                            <span>{(negocio.detalles || negocio.descripcion || '').substring(0, 150)}{(negocio.detalles || negocio.descripcion || '').length > 150 ? '...' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Business Info Card */}
            <div className={styles.componentCard}>
                <div className={styles.componentHeader}>
                    <h2 className={styles.componentTitle}>Información del Negocio</h2>
                </div>
                
                <form onSubmit={handleSave} className={styles.formGrid}>
                    <div className={styles.formColumn}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="businessName">Nombre del negocio</label>
                            <input 
                                type="text" 
                                id="businessName" 
                                name="Nombre"
                                className={styles.formInput} 
                                defaultValue={negocio.nombre}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="businessPhone">Teléfono del local</label>
                            <input 
                                type="tel" 
                                id="businessPhone" 
                                name="TelefonoNegocio"
                                className={styles.formInput} 
                                defaultValue={negocio.telefonoNegocio || negocio.telefono || ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="businessLocation">Ubicación del local</label>
                            <input 
                                type="text" 
                                id="businessLocation" 
                                name="Ubicacion"
                                className={styles.formInput} 
                                defaultValue={negocio.ubicacion || negocio.direccion || ''}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles.formLabel} htmlFor="businessDetails">Detalles del local</label>
                        <textarea 
                            id="businessDetails" 
                            name="Detalles"
                            className={styles.formTextarea}
                            defaultValue={negocio.detalles || negocio.descripcion || ''}
                            rows={6}
                            placeholder="Especialistas en componentes de alto rendimiento. Ofrecemos ensamblaje personalizado y soporte técnico..."
                        />
                    </div>
                    
                    <div className={styles.formFooter}>
                        <button 
                            type="submit" 
                            className={`${styles.btnPrimary} ${savingState === 'saving' ? styles.btnSaving : ''} ${savingState === 'saved' ? styles.btnSaved : ''}`}
                            disabled={savingState !== 'idle'}
                        >
                            {savingState === 'idle' && <><Save size={18} /> Guardar Cambios</>}
                            {savingState === 'saving' && <><Loader size={18} /> Guardando...</>}
                            {savingState === 'saved' && <><CheckCircle size={18} /> ¡Guardado!</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal para cambiar banner */}
            {isBannerModalOpen && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={handleCancelBanner}>
                    <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Cambiar Banner</h2>
                            <button className={styles.closeModal} onClick={handleCancelBanner}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.imageUploadContainer}>
                                {!tempBannerPreview ? (
                                    <div className={styles.imageUploadArea}>
                                        <div className={styles.imageUploadIcon}>
                                            <UploadCloud size={48} />
                                        </div>
                                        <div className={styles.imageUploadText}>
                                            Arrastra una imagen aquí o haz clic para seleccionar
                                        </div>
                                        <button 
                                            type="button" 
                                            className={styles.imageUploadBtn}
                                            onClick={() => bannerFileRef.current?.click()}
                                        >
                                            Seleccionar Imagen
                                        </button>
                                        <input 
                                            type="file" 
                                            id="bannerUploader" 
                                            ref={bannerFileRef}
                                            accept="image/*" 
                                            className={styles.hiddenInput}
                                            onChange={handleBannerChange}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.imagePreviewContainer}>
                                        <img src={tempBannerPreview} className={styles.previewImage} alt="Vista previa del banner" />
                                        <div className={styles.previewActions}>
                                            <button 
                                                type="button" 
                                                className={styles.btnChangeImage}
                                                onClick={() => bannerFileRef.current?.click()}
                                            >
                                                Cambiar Imagen
                                            </button>
                                            <button 
                                                type="button" 
                                                className={styles.btnRemoveImage}
                                                onClick={handleRemoveBannerPreview}
                                            >
                                                Quitar Imagen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={handleCancelBanner}>Cancelar</button>
                            <button className={styles.btnSave} onClick={handleSaveBanner}>Guardar Banner</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para cambiar avatar */}
            {isAvatarModalOpen && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={handleCancelAvatar}>
                    <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Cambiar Logo</h2>
                            <button className={styles.closeModal} onClick={handleCancelAvatar}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.imageUploadContainer}>
                                {!tempAvatarPreview ? (
                                    <div className={styles.imageUploadArea}>
                                        <div className={styles.imageUploadIcon}>
                                            <UploadCloud size={48} />
                                        </div>
                                        <div className={styles.imageUploadText}>
                                            Arrastra una imagen aquí o haz clic para seleccionar
                                        </div>
                                        <button 
                                            type="button" 
                                            className={styles.imageUploadBtn}
                                            onClick={() => avatarFileRef.current?.click()}
                                        >
                                            Seleccionar Imagen
                                        </button>
                                        <input 
                                            type="file" 
                                            id="avatarUploader" 
                                            ref={avatarFileRef}
                                            accept="image/*" 
                                            className={styles.hiddenInput}
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.imagePreviewContainer}>
                                        <img src={tempAvatarPreview} className={styles.previewImage} alt="Vista previa del logo" />
                                        <div className={styles.previewActions}>
                                            <button 
                                                type="button" 
                                                className={styles.btnChangeImage}
                                                onClick={() => avatarFileRef.current?.click()}
                                            >
                                                Cambiar Imagen
                                            </button>
                                            <button 
                                                type="button" 
                                                className={styles.btnRemoveImage}
                                                onClick={handleRemoveAvatarPreview}
                                            >
                                                Quitar Imagen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={handleCancelAvatar}>Cancelar</button>
                            <button className={styles.btnSave} onClick={handleSaveAvatar}>Guardar Logo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};