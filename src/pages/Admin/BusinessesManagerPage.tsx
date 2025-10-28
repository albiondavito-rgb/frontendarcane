import React, { useState, useMemo, useEffect } from 'react';
import styles from './BusinessesManagerPage.module.css';
import { Search, Trash2, CheckCircle, Loader } from 'react-feather';
import { getAllBusinesses, deleteBusiness } from '../../api/adminBusinessService';
import type { AdminBusiness } from '../../types/admin.types';

type Business = AdminBusiness;

const getStatusComponent = (status: string) => {
    switch (status.toLowerCase()) {
        case 'activo':
        case 'aprobado':
            return <span className={`${styles.statusBadge} ${styles.statusActive}`}>Activo</span>;
        case 'inactivo':
        case 'rechazado':
            return <span className={`${styles.statusBadge} ${styles.statusInactive}`}>Inactivo</span>;
        case 'pendiente':
            return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pendiente</span>;
        default:
            return <span className={styles.statusBadge}>{status}</span>;
    }
};

const BusinessesManagerPage: React.FC = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingDeactivateId, setConfirmingDeactivateId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
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
            const businessesData = await getAllBusinesses();
            setBusinesses(businessesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar negocios');
            console.error('Error loading businesses:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateClick = async (businessId: string) => {
        if (confirmingDeactivateId === businessId) {
            setProcessingId(businessId);
            try {
                // Agregar demora para UX como en BusinessProductosPage
                await new Promise(resolve => setTimeout(resolve, 750));
                await deleteBusiness(parseInt(businessId));
                setBusinesses(businesses.map(b => b.id.toString() === businessId ? { ...b, estado: 'Rechazado' } : b));
                setNotification({ type: 'success', message: 'Negocio desactivado exitosamente' });
                setTimeout(() => setNotification(null), 3000);
            } catch (err) {
                setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al desactivar el negocio' });
                setTimeout(() => setNotification(null), 4000);
            } finally {
                setProcessingId(null);
                setConfirmingDeactivateId(null);
            }
        } else {
            setConfirmingDeactivateId(businessId);
            setTimeout(() => {
                setConfirmingDeactivateId(currentId => (currentId === businessId ? null : currentId));
            }, 3000);
        }
    };

    const filteredBusinesses = useMemo(() => {
        return businesses.filter(business =>
            Object.values(business).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [businesses, searchTerm]);

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
        <div className={styles.mainGrid}>
            <div className={styles.mainContentArea}>
                <div className={styles.componentCard}>
                    <div className={styles.componentHeader}>
                        <h2 className={styles.componentTitle}>Gestión de Negocios</h2>
                    </div>
                    {notification && (
                        <div className={`${styles.notice} ${notification.type === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    <div className={styles.businessManagementToolbar}>
                        <div className={styles.searchContainer}>
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Buscar negocios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className={styles.searchIcon} size={20} />
                        </div>
                    </div>
                    
                    <div className={styles.tableContainer}>
                        <table className={styles.businessDatagrid}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario ID</th>
                                    <th>Nombre del Negocio</th>
                                    <th>Teléfono Negocio</th>
                                    <th>Ubicación</th>
                                    <th>Estado</th>
                                    <th>Fecha de Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBusinesses.map((business) => (
                                    <tr key={business.id}>
                                        <td>{business.id}</td>
                                        <td>{business.usuarioId}</td>
                                        <td>{business.nombre}</td>
                                        <td>{business.telefonoNegocio}</td>
                                        <td>{business.ubicacion}</td>
                                        <td>{getStatusComponent(business.estado)}</td>
                                        <td>{new Date(business.fechaCreacion).toLocaleDateString('es-ES')}</td>
                                        <td>
                                            <div className={styles.businessActions}>
                                                <button 
                                                    className={`${styles.btnDelete} ${confirmingDeactivateId === business.id.toString() ? styles.confirming : ''} ${processingId === business.id.toString() ? styles.btnSaving : ''}`}
                                                    onClick={() => handleDeactivateClick(business.id.toString())}
                                                    disabled={processingId !== null}
                                                >
                                                    {processingId === business.id.toString() ? (
                                                        <><Loader size={16} className={styles.spinnerIcon} /> Desactivando...</>
                                                    ) : confirmingDeactivateId === business.id.toString() ? (
                                                        <><CheckCircle size={16}/> Confirmar</>
                                                    ) : (
                                                        <><Trash2 size={16}/> Desactivar</>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessesManagerPage;