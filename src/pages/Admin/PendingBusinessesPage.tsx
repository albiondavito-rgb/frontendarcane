import { useState, useEffect } from 'react';
import styles from './PendingBusinessesPage.module.css';
import { Clock, CheckCircle, XCircle, Inbox, Info, User, Calendar, FileText, Briefcase, Image, Check, X, Loader } from 'react-feather';
import { getAllBusinesses, approveBusiness, rejectBusiness } from '../../api/adminBusinessService';
import { API_DOMAIN } from '../../api/endpoints';
import { getAllUsers } from '../../api/adminUserService';
import type { AdminBusiness } from '../../types/admin.types';

type Business = AdminBusiness & {
  firstName: string;
  lastName: string;
  userPhone: string;
  businessPhone: string;
  location: string;
  description: string;
  image: string;
};

const TABS = [
    { filter: 'Pendiente', icon: Clock, label: 'Pendientes' },
    { filter: 'Aprobado', icon: CheckCircle, label: 'Confirmados' },
    { filter: 'Rechazado', icon: XCircle, label: 'Rechazados' },
];

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'Pendiente':
            return { text: 'Pendiente', className: styles.statusPending, icon: Clock };
        case 'Aprobado':
            return { text: 'Confirmado', className: styles.statusConfirmed, icon: CheckCircle };
        case 'Rechazado':
            return { text: 'Rechazado', className: styles.statusRejected, icon: XCircle };
        default:
            return { text: '', className: '', icon: null };
    }
};

const PendingBusinessesPage = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filterStatus, setFilterStatus] = useState('Pendiente');
    const [sortMode, setSortMode] = useState<'fecha_desc' | 'id_asc' | 'id_desc'>('fecha_desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Cargar negocios al montar el componente
    useEffect(() => {
        loadBusinesses();
    }, []);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            setError(null);
            const [businessesData, usersData] = await Promise.all([
                getAllBusinesses(),
                getAllUsers()
            ]);
            const userMap = new Map<number, { nombre: string; apellido: string; telefono: string }>();
            usersData.forEach(u => userMap.set(u.id, { nombre: u.nombre, apellido: u.apellido, telefono: u.telefono || '' }));
            // Transformar los datos para que coincidan con la interfaz esperada
            const toAbsolute = (url?: string) => {
                if (!url) return '';
                if (/^https?:\/\//i.test(url)) return url;
                return `${API_DOMAIN}${url.startsWith('/') ? '' : '/'}${url}`;
            };

            const transformedBusinesses: Business[] = businessesData.map(business => ({
                ...business,
                // Normalizar estado del backend (Activo) al mostrado (Aprobado)
                estado: business.estado === 'Activo' ? 'Aprobado' : business.estado,
                firstName: userMap.get(business.usuarioId)?.nombre || 'Usuario',
                lastName: userMap.get(business.usuarioId)?.apellido || 'Apellido',
                userPhone: userMap.get(business.usuarioId)?.telefono || business.telefonoNegocio,
                businessPhone: business.telefonoNegocio,
                location: business.ubicacion,
                description: business.detalles,
                image: toAbsolute(business.imagenPerfilUrl)
            }));
            setBusinesses(transformedBusinesses);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar negocios');
        } finally {
            setLoading(false);
        }
    };

    const filteredBusinesses = businesses
        .filter(business => business.estado === filterStatus)
        .slice()
        .sort((a, b) => {
            if (sortMode === 'fecha_desc') {
                return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
            }
            if (sortMode === 'id_asc') return a.id - b.id;
            return b.id - a.id;
        });

    const openModal = (business: Business) => {
        setSelectedBusiness(business);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBusiness(null);
    };

    const handleUpdateBusinessStatus = async (businessId: number, status: 'Aprobado' | 'Rechazado') => {
        try {
            if (status === 'Aprobado') {
                await approveBusiness(businessId);
            } else {
                await rejectBusiness(businessId);
            }
            
            setBusinesses(currentBusinesses =>
                currentBusinesses.map(b =>
                    b.id === businessId ? { ...b, estado: status } : b
                )
            );
            
            // Mostrar mensaje de éxito en la interfaz
            setNotification({ type: 'success', message: status === 'Aprobado' ? 'Negocio aprobado exitosamente' : 'Negocio rechazado exitosamente' });
            setTimeout(() => setNotification(null), 3000);
            
            closeModal();
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al actualizar el estado del negocio' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    if (loading) {
        return (
            <div className={styles.mainGrid}>
                <div className={styles.mainContentArea}>
                    <div className={styles.componentCard}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Loader size={32} className={styles.loadingSpinner} />
                            <p>Cargando negocios...</p>
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
                            <button onClick={loadBusinesses}>Reintentar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.mainGrid}>
                <div className={styles.mainContentArea}>
                    <div className={styles.componentCard}>
                        <div className={styles.componentHeader}>
                            <h2 className={styles.componentTitle}>Negocios Pendientes por Confirmar</h2>
                        </div>
                        {notification && (
                            <div className={`${styles.notice} ${notification.type === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
                                {notification.message}
                            </div>
                        )}
                        
                        <div className={styles.filterTabs}>
                            {TABS.map(tab => (
                                <button 
                                    key={tab.filter}
                                    className={`${styles.filterTab} ${filterStatus === tab.filter ? styles.active : ''}`}
                                    onClick={() => setFilterStatus(tab.filter)}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className={styles.sortRow}>
                            <label className={styles.sortLabel} htmlFor="businessSort">Ordenar por</label>
                            <select
                                id="businessSort"
                                className={styles.filterSelect}
                                value={sortMode}
                                onChange={e => setSortMode(e.target.value as any)}
                            >
                                <option value="fecha_desc">Fecha (recientes primero)</option>
                                <option value="id_asc">ID (ascendente)</option>
                                <option value="id_desc">ID (descendente)</option>
                            </select>
                        </div>
                        
                        <div className={styles.businessGrid}>
                            {filteredBusinesses.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <Inbox size={48} />
                                    </div>
                                    <h3 className={styles.emptyTitle}>No hay negocios</h3>
                                    <p className={styles.emptyDescription}>
                                        No hay negocios en la categoría '{filterStatus}'.
                                    </p>
                                </div>
                            ) : (
                                filteredBusinesses.map(business => {
                                    const statusInfo = getStatusInfo(business.estado);
                                    const StatusIcon = statusInfo.icon;
                                    return (
                                        <div key={business.id} className={styles.businessCard} onClick={() => openModal(business)}>
                                            <div className={styles.businessHeader}>
                                                <div>
                                                    <h3 className={styles.businessTitle}>{business.nombre}</h3>
                                                    <div className={styles.businessId}>ID: #{business.id}</div>
                                                </div>
                                                <div className={`${styles.businessStatus} ${statusInfo.className}`}>
                                                    {StatusIcon && <StatusIcon size={16} />}
                                                    {statusInfo.text}
                                                </div>
                                            </div>
                                            <div className={styles.businessBody}>
                                                <div className={styles.businessDetail}>
                                                    <div className={styles.detailIcon}><User size={16}/></div>
                                                    <div className={styles.detailText}>
                                                        <span className={styles.detailLabel}>Usuario:</span> {business.firstName} {business.lastName}
                                                    </div>
                                                </div>
                                                <div className={styles.businessDetail}>
                                                    <div className={styles.detailIcon}><Calendar size={16}/></div>
                                                    <div className={styles.detailText}>
                                                        <span className={styles.detailLabel}>Fecha:</span> {new Date(business.fechaCreacion).toLocaleDateString('es-ES')}
                                                    </div>
                                                </div>
                                                <div className={styles.businessDetail}>
                                                    <div className={styles.detailIcon}><FileText size={16}/></div>
                                                    <div className={styles.detailText}>
                                                        <span className={styles.detailLabel}>Descripción:</span> {business.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.businessFooter}>
                                                {business.estado === 'Pendiente' && (
                                                    <>
                                                        <button 
                                                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateBusinessStatus(business.id, 'Aprobado'); }}
                                                        >
                                                            <Check size={16} /> Confirmar
                                                        </button>
                                                        <button 
                                                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateBusinessStatus(business.id, 'Rechazado'); }}
                                                        >
                                                            <X size={16} /> Rechazar
                                                        </button>
                                                    </>
                                                )}
                                                {business.estado === 'Aprobado' && (
                                                    <>
                                                        <button 
                                                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                                            disabled
                                                        >
                                                            <Check size={16} /> Confirmado
                                                        </button>
                                                    </>
                                                )}
                                                {business.estado === 'Rechazado' && (
                                                    <>
                                                        <button 
                                                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateBusinessStatus(business.id, 'Aprobado'); }}
                                                        >
                                                            <Check size={16} /> Aceptar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && selectedBusiness && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                <Info size={20} />
                                Detalles del Negocio
                            </h3>
                            <button className={styles.modalClose} onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalSection}>
                                <div className={styles.businessImage}>
                                    {selectedBusiness.image ? 
                                        <img src={selectedBusiness.image} alt={selectedBusiness.nombre} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'12px'}}/> : 
                                        <Image size={48} />
                                    }
                                </div>
                                <h4 className={styles.modalSectionTitle}><Info size={16}/>Información General</h4>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>ID del Negocio</span><div className={styles.infoValue}>#{selectedBusiness.id}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Nombre del Negocio</span><div className={styles.infoValue}>{selectedBusiness.nombre}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Estado</span><div className={styles.infoValue}>{getStatusInfo(selectedBusiness.estado).text}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Fecha de Registro</span><div className={styles.infoValue}>{new Date(selectedBusiness.fechaCreacion).toLocaleDateString('es-ES')}</div></div>
                                </div>
                            </div>
                            <div className={styles.modalSection}>
                                <h4 className={styles.modalSectionTitle}><User size={16}/>Información del Propietario</h4>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Nombre</span><div className={styles.infoValue}>{selectedBusiness.firstName}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Apellido</span><div className={styles.infoValue}>{selectedBusiness.lastName}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Usuario ID</span><div className={styles.infoValue}>{selectedBusiness.usuarioId}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Teléfono Personal</span><div className={styles.infoValue}>{selectedBusiness.userPhone}</div></div>
                                </div>
                            </div>
                            <div className={styles.modalSection}>
                                <h4 className={styles.modalSectionTitle}><Briefcase size={16}/>Información del Negocio</h4>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Teléfono del Negocio</span><div className={styles.infoValue}>{selectedBusiness.businessPhone}</div></div>
                                    <div className={styles.infoItem}><span className={styles.infoLabel}>Ubicación</span><div className={styles.infoValue}>{selectedBusiness.location}</div></div>
                                </div>
                            </div>
                            <div className={styles.modalSection}>
                                <h4 className={styles.modalSectionTitle}><FileText size={16}/>Detalles Adicionales</h4>
                                <div className={styles.infoItem}><span className={styles.infoLabel}>Descripción</span><div className={styles.infoValue} style={{minHeight:'80px'}}>{selectedBusiness.description}</div></div>
                            </div>
                        </div>
                        {selectedBusiness.estado === 'Pendiente' && (
                            <div className={styles.modalFooter}>
                                <button className={`${styles.actionBtn} ${styles.confirmBtn}`} onClick={() => handleUpdateBusinessStatus(selectedBusiness.id, 'Aprobado')}>
                                    <Check size={16} /> Confirmar Negocio
                                </button>
                                <button className={`${styles.actionBtn} ${styles.rejectBtn}`} onClick={() => handleUpdateBusinessStatus(selectedBusiness.id, 'Rechazado')}>
                                    <X size={16} /> Rechazar Negocio
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PendingBusinessesPage;