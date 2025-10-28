
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerNegocio, eliminarMiNegocio } from '../../api/negocioService';
import type { RegisterNegocioDto } from '../../types/negocio';
import styles from './Panels.module.css';

type ErrorState = Record<string, string[] | string | undefined>;
type PanelStatus = 'EDITING' | 'PENDING' | 'ALREADY_APPROVED' | 'SUBMITTED' | 'REJECTED';

export const RegisterBusinessPanel = () => {
  const { user, refreshUserData, negocio } = useAuth();
  const navigate = useNavigate();

  // Estado para los campos del negocio
  const [formData, setFormData] = useState<RegisterNegocioDto>({
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
  });
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estado para la UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState | null>(null);
  const [panelStatus, setPanelStatus] = useState<PanelStatus>('EDITING');

  // Determina el estado del panel basado en el estado del negocio del usuario
  useEffect(() => {
    const isApprovedStatus = (s?: string) => {
      if (!s) return false;
      const v = s.trim().toLowerCase();
      return v === 'aprobado' || v === 'aprobada' || v === 'activo' || v === 'active' || v === 'approved';
    };

    const isRejectedStatus = (s?: string) => {
        if (!s) return false;
        return s.trim().toLowerCase() === 'rechazado';
    };

    const estado = negocio?.estado;

    if (isApprovedStatus(estado)) {
      setPanelStatus('ALREADY_APPROVED');
    } else if (isRejectedStatus(estado)) {
      setPanelStatus('REJECTED');
    } else if (estado) { // Cualquier otro estado (Pendiente, etc.)
      setPanelStatus('PENDING');
    } else {
      setPanelStatus('EDITING');
    }
  }, [negocio]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imagen) {
        setErrors({ imagen: "La imagen del negocio es requerida." });
        return;
    }
    if (!user?.id) {
        setErrors({ form: "Debes estar autenticado para registrar un negocio." });
        return;
    }

    setLoading(true);
    setErrors(null);

    try {
      const result = await registerNegocio(formData, imagen, user.id);
      console.log('REGISTRO EXITOSO:', result);
      setPanelStatus('SUBMITTED');
      // Refrescar datos del usuario/negocio para reflejar estado
      try { await refreshUserData(); } catch {}
    } catch (err: any) {
      console.error('ERROR EN EL REGISTRO:', err);
      const apiErrors: ErrorState = {};
      if (err.errors) {
        for (const key in err.errors) {
          apiErrors[key.toLowerCase()] = err.errors[key];
        }
      } else if (err.message) {
        apiErrors.form = err.message;
      } else {
        apiErrors.form = "Ocurrió un error inesperado.";
      }
      setErrors(apiErrors);
      setPanelStatus('EDITING');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAndRetry = async () => {
    setLoading(true);
    setErrors(null);
    try {
      await eliminarMiNegocio();
      // La siguiente línea es clave: refresca el estado del usuario en toda la app.
      // El contexto ahora tendrá `negocio: null`, y este panel volverá al estado de edición.
      await refreshUserData(); 
    } catch (err: any) {
      setErrors({ form: err.message || "No se pudo eliminar la solicitud. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  const isPending = panelStatus === 'PENDING' || panelStatus === 'SUBMITTED';
  const isRejected = panelStatus === 'REJECTED';
  const isApproved = panelStatus === 'ALREADY_APPROVED';

  return (
    <div className={styles.panelContainer}>
      {isPending && (
        <div className={styles.statusOverlay}>
          <div className={styles.statusBox}>
            <div className={styles.spinner}></div>
            <div className={styles.statusMessage}>
              Su negocio está siendo revisado para la aprobación
            </div>
          </div>
        </div>
      )}

      {isApproved && (
        <div className={`${styles.statusOverlay} ${styles.approvedOverlay}`}>
            <div className={styles.statusBox}>
                <div className={styles.successIcon}>✓</div>
                <div className={styles.statusMessage}>
                    <strong>Ya tienes un negocio registrado</strong>
                    <p>Tu negocio "{negocio?.nombre}" ya fue aprobado.</p>
                    <button onClick={() => navigate('/negocio/inicio')} className={`${styles.btn} ${styles.btnNav}`}>
                        Ir a mi Panel de Negocio
                    </button>
                </div>
            </div>
        </div>
      )}

      {isRejected && (
        <div className={`${styles.statusOverlay} ${styles.rejectedOverlay}`}>
            <div className={styles.statusBox}>
                <div className={styles.errorIcon}>!</div>
                <div className={styles.statusMessage}>
                    <strong>Solicitud Rechazada</strong>
                    <p>Tu solicitud de registro fue rechazada. Puedes eliminarla para enviar una nueva.</p>
                    <button onClick={handleDeleteAndRetry} className={`${styles.btn} ${styles.btnRetry}`} disabled={loading}>
                        {loading ? 'Eliminando...' : 'Eliminar y Empezar de Nuevo'}
                    </button>
                    {errors?.form && <div style={{color: 'white', fontSize: '12px', marginTop: '1rem'}}>{errors.form as string}</div>}
                </div>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={isPending || isRejected || isApproved ? styles.blurredContent : ''}>
        {/* Sección de datos del propietario (solo lectura) */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>Datos del Propietario</h3>
          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.formCol}`}>
              <label className={styles.formLabel}>Nombre</label>
              <input type="text" className={styles.formInput} value={user?.nombre || ''} readOnly />
            </div>
            <div className={`${styles.formGroup} ${styles.formCol}`}>
              <label className={styles.formLabel}>Apellido</label>
              <input type="text" className={styles.formInput} value={user?.apellido || ''} readOnly />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input type="email" className={styles.formInput} value={user?.email || ''} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Teléfono</label>
            <input type="tel" className={styles.formInput} value={user?.telefono || ''} readOnly />
          </div>
        </div>

        {/* Sección de datos del negocio (editable) */}
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>Datos del Negocio</h3>
          <div className={styles.formGroup}>
            <label htmlFor="nombre" className={styles.formLabel}>Nombre del Negocio</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={styles.formInput} required />
            {errors?.nombre && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.nombre}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="descripcion" className={styles.formLabel}>Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} className={styles.formInput} style={{height: '100px'}} required />
            {errors?.descripcion && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.descripcion}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="direccion" className={styles.formLabel}>Dirección</label>
            <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className={styles.formInput} required />
            {errors?.direccion && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.direccion}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="telefono" className={styles.formLabel}>Teléfono del Local</label>
            <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} className={styles.formInput} required />
            {errors?.telefono && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.telefono}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imagen" className={styles.formLabel}>Logo o Imagen del Negocio</label>
            <input type="file" id="imagen" name="imagen" onChange={handleFileChange} className={styles.formInput} accept="image/*" required />
            {imagePreview && <img src={imagePreview} alt="Previsualización" style={{width: '100px', height: '100px', marginTop: '1rem', borderRadius: '8px'}}/>}
            {errors?.imagen && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.imagen}</div>}
          </div>

          {errors?.form && <div style={{color: 'var(--error-color)', fontSize: '12px', marginTop: '4px'}}>{errors.form as string}</div>}
        </div>

        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? 'Enviando Petición...' : 'Registrar Mi Negocio'}
        </button>
      </form>
    </div>
  );
};
