import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTrabajadoresPorNegocio, createTrabajador, deleteTrabajador } from '../../api/trabajadorService';
import { findUserByEmail } from '../../api/adminUserService';
import type { TrabajadorDto, TrabajadorCreateDto } from '../../types/trabajador.types';
import type { FoundUser } from '../../types/user.types';
import styles from './BusinessTrabajadoresPage.module.css';
import { Search, Plus, Trash2, X, Loader, CheckCircle } from 'react-feather';

export const BusinessTrabajadoresPage = () => {
    const { negocio } = useAuth();
    const [workers, setWorkers] = useState<TrabajadorDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{type: 'success'|'error'; message: string} | null>(null);
    
    // Estados para el modal de agregar trabajador
    const [emailToSearch, setEmailToSearch] = useState('');
    const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
    const [isConfirming, setIsConfirming] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [deletingWorkerId, setDeletingWorkerId] = useState<number | null>(null);

    useEffect(() => {
        loadTrabajadores();
    }, [negocio]);

    const loadTrabajadores = async () => {
        if (!negocio) return;
        const businessId = negocio.negocioId || negocio.id;
        if (!businessId) return;

        try {
            setLoading(true);
            const data = await getTrabajadoresPorNegocio(businessId);
            setWorkers(data);
        } catch (error) {
            console.error('Error al cargar trabajadores:', error);
            showNotification('error', 'Error al cargar los trabajadores');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const openModal = () => {
        setIsModalOpen(true);
        setEmailToSearch('');
        setFoundUser(null);
        setIsConfirming('idle');
        setSavingState('idle');
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleDeleteClick = async (workerId: number) => {
        // Si el botón ya está en modo de confirmación, procede a eliminar
        if (confirmingDeleteId === workerId) {
            if (!negocio || !negocio.usuarioId) {
                showNotification('error', 'No se pudo identificar al propietario del negocio.');
                return;
            }

            const emprendedorId = negocio.usuarioId;

            try {
                setDeletingWorkerId(workerId); // Inicia el estado de carga
                await new Promise(resolve => setTimeout(resolve, 750)); // Demora para UX

                await deleteTrabajador(workerId, emprendedorId);
                showNotification('success', 'Trabajador eliminado exitosamente');
                loadTrabajadores(); // Recarga la lista, lo que elimina la fila
            } catch (error) {
                console.error('Error al eliminar trabajador:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el trabajador.';
                showNotification('error', errorMessage);
            } finally {
                // Limpia los estados para asegurar que los botones vuelvan a la normalidad
                setConfirmingDeleteId(null);
                setDeletingWorkerId(null);
            }
        } else {
            // Si es el primer clic, entra en modo de confirmación
            setDeletingWorkerId(null); // Asegurarse de que no haya otro en modo de carga
            setConfirmingDeleteId(workerId);
            setTimeout(() => {
                // Si no se confirma en 3 segundos, revierte el estado
                setConfirmingDeleteId(currentId => (currentId === workerId ? null : currentId));
            }, 3000);
        }
    };

    const handleConfirmEmail = async () => {
        if (!emailToSearch) {
            showNotification('error', 'Por favor, ingresa un email.');
            return;
        }
        setIsConfirming('loading');
        setFoundUser(null);

        // Pausa artificial para mejorar la UX y mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 750));

        const user = await findUserByEmail(emailToSearch);
        if (user) {
            setFoundUser(user);
            setIsConfirming('success');
        } else {
            setIsConfirming('error');
            showNotification('error', 'Usuario no encontrado con ese email.');
            setTimeout(() => setIsConfirming('idle'), 2500);
        }
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validar que el objeto negocio y el usuario encontrado existan
        if (!negocio || !foundUser) {
            showNotification('error', 'Debes confirmar un usuario válido primero.');
            return;
        }

        // Extraer los IDs correctos. El ID del emprendedor es el `usuarioId` en el objeto del negocio.
        const emprendedorId = negocio.usuarioId;
        const negocioId = negocio.id;

        // Validar que los IDs necesarios se hayan obtenido correctamente
        if (!emprendedorId || !negocioId) {
            showNotification('error', 'No se pudo identificar el negocio o el propietario.');
            return;
        }

        try {
            setSavingState('saving');
            await new Promise(resolve => setTimeout(resolve, 750)); // Demora para UX
            const newWorker: TrabajadorCreateDto = {
                negocioId: negocioId, // El ID del negocio va en el cuerpo del DTO
                email: foundUser.email,
            };
            
            // El ID del emprendedor (dueño) va en la URL
            await createTrabajador(emprendedorId, newWorker);

            showNotification('success', 'Trabajador agregado exitosamente');
            setSavingState('saved');
            setTimeout(() => {
                closeModal();
                loadTrabajadores();
            }, 800);
        } catch (error) {
            console.error('Error al crear trabajador:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error al agregar el trabajador. El usuario ya podría ser trabajador.';
            showNotification('error', errorMessage);
            setSavingState('idle');
        }
    };

    return (
        <div className={styles.mainGrid}>
            <div className={styles.componentCard}>
                <div className={styles.componentHeader}>
                    <h2 className={styles.componentTitle}>Gestión de Trabajadores</h2>
                </div>

                <div className={styles.userManagementToolbar}>
                    <div className={styles.searchCreateContainer}>
                        <div className={styles.searchBar}>
                            <input 
                                type="text" 
                                className={styles.searchInput} 
                                placeholder="Buscar trabajador..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className={styles.searchIcon} size={20} />
                        </div>
                        <button className={styles.createBtn} onClick={openModal}>
                            <Plus size={20} />
                            Agregar Trabajador
                        </button>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.userDatagrid}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>
                                        <Loader size={32} className={styles.spinner} />
                                        <p>Cargando trabajadores...</p>
                                    </td>
                                </tr>
                            ) : workers.filter(w => 
                                w.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                w.email.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((worker) => (
                                <tr key={worker.id}>
                                    <td>{worker.id}</td>
                                    <td>{worker.nombre}</td>
                                    <td>{worker.apellido}</td>
                                    <td>{worker.telefono || 'N/A'}</td>
                                    <td>{worker.email}</td>
                                    <td>
                                        <div className={styles.userActions}>
                                            <button 
                                                className={`${styles.btnDelete} ${confirmingDeleteId === worker.id ? styles.confirming : ''} ${deletingWorkerId === worker.id ? styles.btnSaving : ''}`}
                                                onClick={() => handleDeleteClick(worker.id)}
                                                disabled={deletingWorkerId !== null}
                                            >
                                                {deletingWorkerId === worker.id ? (
                                                    <><Loader size={16} /> Eliminando...</>
                                                ) : confirmingDeleteId === worker.id ? (
                                                    <><CheckCircle size={16} /> Confirmar</>
                                                ) : (
                                                    <><Trash2 size={16} /> Eliminar</>
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

            {notification && (
                <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            {isModalOpen && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
                    <div className={styles.userModal} onClick={(e) => e.stopPropagation()}>
                        <form id="trabajadorForm" onSubmit={handleSave}>
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Agregar Trabajador</h2>
                                <button type="button" className={styles.closeModal} onClick={closeModal}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.formRow}>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Nombre</label>
                                            <input type="text" className={styles.formInput} value={foundUser?.nombre || ''} readOnly />
                                        </div>
                                    </div>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Apellido</label>
                                            <input type="text" className={styles.formInput} value={foundUser?.apellido || ''} readOnly />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Teléfono</label>
                                    <input type="text" className={styles.formInput} value={foundUser?.telefono || 'N/A'} readOnly />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="workerEmail">Email del Usuario</label>
                                    <div className={styles.emailContainer}>
                                        <div className={styles.emailInput}>
                                            <input 
                                                type="email" 
                                                className={styles.formInput} 
                                                id="workerEmail" 
                                                name="Email"
                                                placeholder="ejemplo@correo.com"
                                                value={emailToSearch}
                                                onChange={(e) => {
                                                    setEmailToSearch(e.target.value);
                                                    if (isConfirming === 'success' || isConfirming === 'error') {
                                                        setIsConfirming('idle');
                                                        setFoundUser(null);
                                                    }
                                                }}
                                                required 
                                            />
                                        </div>
                                        <div className={styles.confirmButton}>
                                            <button 
                                                type="button" 
                                                className={`${styles.btnConfirm} ${isConfirming === 'loading' ? styles.btnLoading : ''} ${isConfirming === 'success' ? styles.btnSuccess : ''}`}
                                                onClick={handleConfirmEmail}
                                                disabled={isConfirming === 'loading' || isConfirming === 'success'}
                                            >
                                                {isConfirming === 'loading' && <><Loader size={18} /> {'Confirmando...'}</>}
                                                {isConfirming === 'success' && <><CheckCircle size={18} /> {'Confirmado'}</>}
                                                {(isConfirming === 'idle' || isConfirming === 'error') && 'Confirmar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancel} onClick={closeModal} disabled={savingState !== 'idle'}>Cancelar</button>
                                <button 
                                    type="submit"
                                    className={`${styles.btnSave} ${savingState === 'saving' ? styles.btnSaving : ''} ${savingState === 'saved' ? styles.btnSaved : ''}`}
                                    disabled={!foundUser || savingState !== 'idle'}
                                >
                                    {savingState === 'idle' && <><Plus size={18} /> Agregar Trabajador</>}
                                    {savingState === 'saving' && <><Loader size={18} /> Agregando...</>}
                                    {savingState === 'saved' && <><CheckCircle size={18} /> ¡Agregado!</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};