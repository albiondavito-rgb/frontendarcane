
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Panels.module.css';
import { updateEmail, updatePassword } from '../../api/userService';
import { Check } from 'react-feather';

export const SecurityPanel = () => {
  const { user, updateLocalUser } = useAuth(); // <- Usar updateLocalUser

  const [userInfo, setUserInfo] = useState({ nombre: '', apellido: '', email: '' });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  // removed unused loading state
  
  // Estado unificado para feedback (éxito o errores generales)
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  // Estado para errores de validación por campo
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Nuevos estados para la edición de email en línea
  const [newEmail, setNewEmail] = useState('');
  const [emailFormStatus, setEmailFormStatus] = useState<'idle' | 'editing' | 'loading' | 'success'>('idle');
  const [passwordFormStatus, setPasswordFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');


  useEffect(() => {
    if (user) {
      setUserInfo({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
      });
      setNewEmail(user.email || ''); // Inicializar con el email actual
    }
  }, [user]);

  useEffect(() => {
    if (passwordFormStatus === 'success') {
      const timer = setTimeout(() => {
        setPasswordFormStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [passwordFormStatus]);

  useEffect(() => {
    if (emailFormStatus === 'success') {
      const timer = setTimeout(() => {
        setEmailFormStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [emailFormStatus]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailEditToggle = () => {
    // Si está en modo edición, vuelve a idle. Si no, entra en modo edición.
    setEmailFormStatus(prev => prev === 'idle' ? 'editing' : 'idle');
    setNewEmail(user?.email || ''); // Resetear al email actual al cancelar
    setErrors({}); // Limpiar errores
    setFeedback({ message: '', type: '' }); // Limpiar feedback
  };

  const handleEmailSave = async () => {
    if (!newEmail || !user || newEmail === user.email) {
      setEmailFormStatus('idle'); // Si no hay cambios, simplemente vuelve a idle
      return;
    }

    setEmailFormStatus('loading');
    setErrors({});
    setFeedback({ message: '', type: '' });

    try {
      await updateEmail(user.id, { nuevoEmail: newEmail });
      setEmailFormStatus('success');
      updateLocalUser({ email: newEmail });
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setFeedback({ message: err.message || 'Ocurrió un error al actualizar el email.', type: 'error' });
      }
      setEmailFormStatus('editing'); // En caso de error, permite al usuario corregir
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Limpiar errores y feedback antes de empezar
    setErrors({});
    setFeedback({ message: '', type: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ ConfirmarNuevaContrasena: ['La nueva contraseña y la confirmación no coinciden.'] });
      return;
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
        setErrors({ 
            ContrasenaActual: !passwords.currentPassword ? ['La contraseña actual es obligatoria.'] : [],
            NuevaContrasena: !passwords.newPassword ? ['La nueva contraseña es obligatoria.'] : [],
        });
        return;
    }

    setPasswordFormStatus('loading');

    try {
      await updatePassword(user.id, {
        contrasenaActual: passwords.currentPassword,
        nuevaContrasena: passwords.newPassword,
        confirmarNuevaContrasena: passwords.confirmPassword,
      });
      
      setPasswordFormStatus('success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setFeedback({ message: err.message || 'Ocurrió un error al cambiar la contraseña.', type: 'error' });
      }
      setPasswordFormStatus('idle');
    }
  };

  return (
    <div>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>Información de la Cuenta</h3>
        
        {feedback.message && <div className={`${styles.alert} ${feedback.type === 'success' ? styles.alertSuccess : styles.alertError}`}>{feedback.message}</div>}

        <div className={styles.formRow} style={{ marginTop: '1rem' }}>
          <div className={`${styles.formGroup} ${styles.formCol}`}>
            <label className={styles.formLabel}>Nombre</label>
            <input type="text" className={styles.formInput} value={userInfo.nombre} readOnly />
          </div>
          <div className={`${styles.formGroup} ${styles.formCol}`}>
            <label className={styles.formLabel}>Apellido</label>
            <input type="text" className={styles.formInput} value={userInfo.apellido} readOnly />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Correo Electrónico</label>
          {emailFormStatus === 'idle' ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="email" className={styles.formInput} value={userInfo.email} readOnly />
              <button type="button" className={styles.btn} style={{ width: 'auto', flexShrink: 0 }} onClick={handleEmailEditToggle}>
                Cambiar
              </button>
            </div>
          ) : (
            <div>
              <input 
                type="email" 
                className={styles.formInput} 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={emailFormStatus === 'loading' || emailFormStatus === 'success'}
              />
              {errors.NuevoEmail && <div className={styles.errorText}>{errors.NuevoEmail[0]}</div>}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  className={`${styles.btn} ${emailFormStatus === 'success' ? styles.btnSuccess : ''}`} 
                  onClick={handleEmailSave} 
                  disabled={emailFormStatus === 'loading' || emailFormStatus === 'success'}
                >
                  {emailFormStatus === 'editing' && 'Guardar'}
                  {emailFormStatus === 'loading' && 'Guardando...'}
                  {emailFormStatus === 'success' && (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Check size={20} /> Hecho
                    </span>
                  )}
                </button>
                <button 
                  type="button" 
                  className={`${styles.btn} ${styles.btnSecondary}`} 
                  onClick={handleEmailEditToggle} 
                  disabled={emailFormStatus === 'loading' || emailFormStatus === 'success'}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit}>
        <div className={styles.settingsSection}>
          <h3 className={styles.settingsSectionTitle}>Cambiar Contraseña</h3>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="currentPassword">Contraseña Actual</label>
            <input 
              type="password"
              className={styles.formInput}
              id="currentPassword"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
            />
            {errors.ContrasenaActual && <div className={styles.errorText}>{errors.ContrasenaActual[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="newPassword">Nueva Contraseña</label>
            <input 
              type="password"
              className={styles.formInput}
              id="newPassword"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
            />
            {errors.NuevaContrasena && <div className={styles.errorText}>{errors.NuevaContrasena[0]}</div>}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <input 
              type="password"
              className={styles.formInput}
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
            />
            {errors.ConfirmarNuevaContrasena && <div className={styles.errorText}>{errors.ConfirmarNuevaContrasena[0]}</div>}
          </div>
        </div>
        <button 
          type="submit" 
          className={`${styles.btn} ${passwordFormStatus === 'success' ? styles.btnSuccess : ''}`}
          disabled={passwordFormStatus === 'loading' || passwordFormStatus === 'success'}
        >
          {passwordFormStatus === 'idle' && 'Actualizar Contraseña'}
          {passwordFormStatus === 'loading' && 'Actualizando...'}
          {passwordFormStatus === 'success' && (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={20} /> Hecho
              </span>
          )}
        </button>
      </form>
    </div>
  );
};
