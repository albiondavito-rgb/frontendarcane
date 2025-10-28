import React, { useState, useMemo, useEffect } from 'react';
import styles from './UsersManagerPage.module.css';
import { Search, Plus, Edit, Trash2, X, Save, Loader, CheckCircle } from 'react-feather';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/adminUserService';
import type { AdminUser, AdminUserCreateDto, AdminUserUpdateDto } from '../../types/admin.types';

type User = AdminUser;

const UsersManagerPage: React.FC = () => {
    const DEFAULT_PASSWORD = 'Contraseña/123';
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Omit<User, 'id' | 'fechaCreacion'> & { id?: string; password?: string }>({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        roles: ['Cliente'],
        password: ''
    });
    const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [sortMode, setSortMode] = useState<'fecha_desc' | 'id_asc' | 'id_desc'>('fecha_desc');
    const [validationErrors, setValidationErrors] = useState<{ nombre?: string; apellido?: string }>({});

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await getAllUsers();
            setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (user: User | null) => {
        setEditingUser(user);
        if (user) {
            setFormData({
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono || '',
                roles: user.roles,
                password: ''
            });
        } else {
            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                telefono: '',
                roles: ['Cliente'],
                password: DEFAULT_PASSWORD
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setSavingState('idle');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (id === 'nombre' && validationErrors.nombre) {
            setValidationErrors(prev => ({ ...prev, nombre: undefined }));
        }
        if (id === 'apellido' && validationErrors.apellido) {
            setValidationErrors(prev => ({ ...prev, apellido: undefined }));
        }
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = e.target.value;
        setFormData(prev => ({ ...prev, roles: [selectedRole] }));
    };

    const handleSaveUser = async () => {
        const errs: { nombre?: string; apellido?: string } = {};
        // 2-50 caracteres, solo letras (con acentos), espacios, apóstrofes o guiones, y al menos una vocal
        const namePattern = /^(?=.{2,50}$)(?=.*[AEIOUaeiouÁÉÍÓÚÜáéíóúü])[A-Za-zÁÉÍÓÚÜáéíóúüÑñ' -]+$/;
        const nombreTrim = (formData.nombre || '').trim();
        const apellidoTrim = (formData.apellido || '').trim();
        const nombreNorm = nombreTrim.replace(/\s+/g, ' ');
        const apellidoNorm = apellidoTrim.replace(/\s+/g, ' ');
        if (!nombreNorm || !namePattern.test(nombreNorm)) {
            errs.nombre = 'Nombre inválido: 2-50 caracteres, solo letras (con acentos), espacios, apóstrofes o guiones, y al menos una vocal.';
        }
        if (!apellidoNorm || !namePattern.test(apellidoNorm)) {
            errs.apellido = 'Apellido inválido: 2-50 caracteres, solo letras (con acentos), espacios, apóstrofes o guiones, y al menos una vocal.';
        }
        if (!formData.email) {
            setNotification({ type: 'error', message: 'El email es obligatorio.' });
            setTimeout(() => setNotification(null), 3000);
        }
        setValidationErrors(errs);
        if (Object.keys(errs).length > 0 || !formData.email) return;

        setSavingState('saving');
        try {
            if (editingUser) {
                // Actualizar usuario existente
                const updateData: AdminUserUpdateDto = {
                    nombre: nombreNorm,
                    apellido: apellidoNorm,
                    email: formData.email.trim(),
                    telefono: formData.telefono || undefined,
                    roles: formData.roles
                };
                const updatedUser = await updateUser(editingUser.id, updateData);
                setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
            } else {
                // Crear nuevo usuario con contraseña por defecto (admin no la ingresa manualmente)
                const createData: AdminUserCreateDto = {
                    nombre: nombreNorm,
                    apellido: apellidoNorm,
                    email: formData.email.trim(),
                    telefono: formData.telefono || undefined,
                    password: DEFAULT_PASSWORD,
                    roles: formData.roles
                };
                const newUser = await createUser(createData);
                setUsers([newUser, ...users]);
            }
            setSavingState('saved');
            setNotification({ type: 'success', message: editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente' });
            setTimeout(() => setNotification(null), 3000);
            setTimeout(() => { closeModal(); }, 800);
        } catch (err) {
            setSavingState('idle');
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al guardar usuario' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleDeleteClick = (userId: string) => {
        if (confirmingDeleteId === userId) {
            handleDeleteUser(Number(userId));
        } else {
            setConfirmingDeleteId(userId);
            setTimeout(() => {
                setConfirmingDeleteId(currentId => (currentId === userId ? null : currentId));
            }, 3000);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            setNotification({ type: 'success', message: 'Usuario eliminado exitosamente' });
            setTimeout(() => setNotification(null), 3000);
            setConfirmingDeleteId(null);
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Error al eliminar usuario' });
            setTimeout(() => setNotification(null), 4000);
            setConfirmingDeleteId(null);
        }
    };

    const filteredUsers = useMemo(() => {
        const base = users.filter(user => 
            `${user.nombre} ${user.apellido} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const sorted = [...base];
        if (sortMode === 'fecha_desc') {
            sorted.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
        } else if (sortMode === 'id_asc') {
            sorted.sort((a, b) => a.id - b.id);
        } else if (sortMode === 'id_desc') {
            sorted.sort((a, b) => b.id - a.id);
        }
        return sorted;
    }, [users, searchTerm, sortMode]);

    if (loading) {
        return (
            <div className={styles.mainGrid}>
                <div className={styles.mainContentArea}>
                    <div className={styles.componentCard}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Loader size={32} className={styles.loadingSpinner} />
                            <p>Cargando usuarios...</p>
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
                            <button onClick={loadUsers}>Reintentar</button>
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
                        <h2 className={styles.componentTitle}>Gestión de Usuarios</h2>
                    </div>
                    {notification && (
                        <div className={`${styles.notice} ${notification.type === 'success' ? styles.noticeSuccess : styles.noticeError}`}>
                            {notification.message}
                        </div>
                    )}
                    
                    <div className={styles.userManagementToolbar}>
                        <div className={styles.searchCreateContainer}>
                            <div className={styles.searchBar}>
                                <input 
                                    type="text" 
                                    className={styles.searchInput} 
                                    placeholder="Buscar por nombre, apellido, correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className={styles.searchIcon} size={20} />
                            </div>


                            <button className={styles.createBtn} onClick={() => openModal(null)}>
                                <Plus size={20} />
                                Crear
                            </button>
                        </div>
                        <select className={styles.filterSelect} value={sortMode} onChange={(e) => setSortMode(e.target.value as any)}>
                            <option value="fecha_desc">Más recientes primero</option>
                            <option value="id_asc">ID ascendente</option>
                            <option value="id_desc">ID descendente</option>
                        </select>
                    </div>
                    
                    <div className={styles.tableContainer}>
                        <table className={styles.userDatagrid}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Correo</th>
                                    <th>Fecha de Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} data-role={user.roles.join(',')}>
                                        <td>{user.id}</td>
                                        <td>{user.nombre}</td>
                                        <td>{user.apellido}</td>
                                        <td>{user.telefono || '-'}</td>
                                        <td>{user.email}</td>
                                        <td>{new Date(user.fechaCreacion).toLocaleDateString('es-ES')}</td>
                                        <td>
                                            <div className={styles.userActions}>
                                                <button className={styles.btnEdit} onClick={() => openModal(user)}>
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button 
                                                    className={`${styles.btnDelete} ${confirmingDeleteId === user.id.toString() ? styles.confirming : ''}`}
                                                    onClick={() => handleDeleteClick(user.id.toString())}
                                                >
                                                    {confirmingDeleteId === user.id.toString() ? <><CheckCircle size={16}/> Confirmar</> : <><Trash2 size={16}/> Eliminar</>}
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

            {isModalOpen && (
                <div className={`${styles.modalOverlay} ${styles.active}`} onClick={closeModal}>
                    <div className={styles.userModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h2>
                            <button className={styles.closeModal} onClick={closeModal}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }}>
                                <div className={styles.formRow}>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel} htmlFor="nombre">Nombre</label>
                                            <input 
                                            required 
                                            type="text" 
                                            className={`${styles.formInput} ${validationErrors.nombre ? styles.invalid : ''}`} 
                                            id="nombre" 
                                            value={formData.nombre || ''} 
                                            onChange={handleInputChange} 
                                        />
                                        {validationErrors.nombre && <div className={styles.errorText}>{validationErrors.nombre}</div>}
                                        </div>
                                    </div>
                                    <div className={styles.formCol}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel} htmlFor="apellido">Apellido</label>
                                            <input 
                                            required 
                                            type="text" 
                                            className={`${styles.formInput} ${validationErrors.apellido ? styles.invalid : ''}`} 
                                            id="apellido" 
                                            value={formData.apellido || ''} 
                                            onChange={handleInputChange} 
                                        />
                                        {validationErrors.apellido && <div className={styles.errorText}>{validationErrors.apellido}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="telefono">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        className={styles.formInput} 
                                        id="telefono"
                                        value={formData.telefono || ''} 
                                        onChange={handleInputChange}
                                        disabled
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="email">Email</label>
                                    <input 
                                        required 
                                        type="email" 
                                        className={styles.formInput} 
                                        id="email"
                                        value={formData.email || ''} 
                                        onChange={handleInputChange} 
                                    />
                                </div>

                                {!editingUser && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel} htmlFor="password">Contraseña predeterminada</label>
                                        <input 
                                            type="text" 
                                            className={styles.formInput} 
                                            id="password" 
                                            value={DEFAULT_PASSWORD} 
                                            readOnly
                                        />
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="role">Rol</label>
                                    <select 
                                        className={styles.formSelect} 
                                        id="role" 
                                        value={formData.roles?.[0] || 'Cliente'} 
                                        onChange={handleRoleChange}
                                    >
                                        <option value="Cliente">Cliente</option>
                                        <option value="Emprendedor">Emprendedor</option>
                                        <option value="Administrador">Administrador</option>
                                    </select>
                                </div>
                            </form>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={closeModal}>Cerrar</button>
                            <button 
                                type="submit"
                                className={`${styles.btnSave} ${savingState === 'saving' ? styles.btnSaving : ''} ${savingState === 'saved' ? styles.btnSaved : ''}`}
                                onClick={handleSaveUser}
                                disabled={savingState !== 'idle'}
                            >
                                {savingState === 'idle' && <><Save size={18} /> Guardar Cambios</>}
                                {savingState === 'saving' && <><Loader size={18} /> Guardando...</>}
                                {savingState === 'saved' && <><CheckCircle size={18} /> ¡Guardado!</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManagerPage;