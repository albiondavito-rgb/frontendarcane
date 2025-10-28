import { useState } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../context/AuthContext';
import type { RegisterPayload } from '../../types/auth.types';
import { ENDPOINTS } from '../../api/endpoints';

type ErrorState = Record<string, string[] | undefined>;

export const RegisterForm = () => {
  const { handleRegister } = useAuth();
  const [formData, setFormData] = useState<RegisterPayload>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrors({ ConfirmPassword: ['Las contraseñas no coinciden.'] });
      setLoading(false);
      return;
    }

    try {
      const response = await handleRegister(formData);
      setSuccessMessage(response.message || '¡Registro exitoso! Ahora puedes iniciar sesión.');
    } catch (err: any) {
      const apiErrors = err.errors || {};
      if (err.message) {
        apiErrors.form = [err.message];
      }
      setErrors(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
  );

  // Si el registro fue exitoso, mostramos solo el mensaje de éxito.
  if (successMessage) {
    return <div className={styles.successText}>{successMessage}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <div className={styles.formRow}>
          <div className={styles.formCol}>
            <label className={styles.formLabel} htmlFor="registerFirstName">Nombre</label>
            <input type="text" className={styles.formInput} id="registerFirstName" name="nombre" placeholder="Juan" value={formData.nombre} onChange={handleChange} required />
            {errors?.Nombre && <div className={styles.errorText}>{errors.Nombre[0]}</div>}
          </div>
          <div className={styles.formCol}>
            <label className={styles.formLabel} htmlFor="registerLastName">Apellido</label>
            <input type="text" className={styles.formInput} id="registerLastName" name="apellido" placeholder="Pérez" value={formData.apellido} onChange={handleChange} required />
            {errors?.Apellido && <div className={styles.errorText}>{errors.Apellido[0]}</div>}
          </div>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="registerEmail">Email</label>
        <input type="email" className={styles.formInput} id="registerEmail" name="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required />
        {errors?.Email && <div className={styles.errorText}>{errors.Email[0]}</div>}
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="registerPassword">Contraseña</label>
        <input type="password" className={styles.formInput} id="registerPassword" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
        {errors?.Password && <div className={styles.errorText}>{errors.Password[0]}</div>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="confirmPassword">Confirmar contraseña</label>
        <input type="password" className={styles.formInput} id="confirmPassword" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
        {errors?.ConfirmPassword && <div className={styles.errorText}>{errors.ConfirmPassword[0]}</div>}
      </div>

      {errors?.form && <div className={styles.errorText}>{errors.form[0]}</div>}

      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
      
      <div className={styles.divider}><span>O regístrate con</span></div>
      
      <a href={ENDPOINTS.USUARIOS.GOOGLE_LOGIN} className={styles.googleBtn}>
        <GoogleIcon />
        Continuar con Google
      </a>
    </form>
  );
};
