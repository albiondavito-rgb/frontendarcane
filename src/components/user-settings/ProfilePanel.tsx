import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateTelefono } from '../../api/userService';
import styles from './Panels.module.css';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Check } from 'react-feather';

export const ProfilePanel = () => {
  const { user, updateLocalUser } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    numero: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        numero: user.telefono || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (formStatus === 'success') {
      const timer = setTimeout(() => {
        setFormStatus('idle');
      }, 2000); // El estado de éxito dura 2 segundos
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormStatus('loading');
    setError(null);

    try {
      await updateTelefono(user.id, { telefono: formData.numero });
      updateLocalUser({ telefono: formData.numero });
      setFormStatus('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo actualizar el teléfono.');
      setFormStatus('idle');
    } 
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>Información Personal</h3>
        
        <div className={styles.formRow}>
          <div className={`${styles.formGroup} ${styles.formCol}`}>
            <label className={styles.formLabel} htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              className={styles.formInput} 
              id="nombre" 
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              readOnly
            />
          </div>
          <div className={`${styles.formGroup} ${styles.formCol}`}>
            <label className={styles.formLabel} htmlFor="apellido">Apellido</label>
            <input 
              type="text" 
              className={styles.formInput} 
              id="apellido" 
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Tu apellido"
              readOnly
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="email">Correo Electrónico</label>
          <input 
            type="email" 
            className={styles.formInput} 
            id="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="numero">Número de Teléfono</label>
          <div className={styles.phoneInputContainer}>
            <PhoneInput
              id="numero"
              placeholder="Tu número de teléfono"
              value={formData.numero}
              onChange={(value) => setFormData(prev => ({ ...prev, numero: value || '' }))}
              defaultCountry="BO"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorText} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className={`${styles.btn} ${formStatus === 'success' ? styles.btnSuccess : ''}`}
        disabled={formStatus === 'loading' || formStatus === 'success'}
      >
        {formStatus === 'idle' && 'Guardar Cambios'}
        {formStatus === 'loading' && 'Guardando...'}
        {formStatus === 'success' && (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Check size={20} /> Hecho
            </span>
        )}
      </button>
    </form>
  );
};
