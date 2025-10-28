import { useState } from 'react';
import styles from './AuthModal.module.css';
import { useAuth } from '../../context/AuthContext';
import type { LoginPayload } from '../../types/auth.types';
import { ENDPOINTS } from '../../api/endpoints';

// El tipo para el estado de errores. Las claves son los nombres de los campos.
type ErrorState = Record<string, string[] | undefined>;

const GoogleIcon = () => (
  <svg className={styles.googleIcon} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
);

export const LoginForm = () => {
  // `handleLogin` es lo único que necesitamos del contexto ahora
  const { handleLogin } = useAuth();
  const [formData, setFormData] = useState<LoginPayload>({ email: '', password: '' });
  
  // Estados locales para la carga y los errores
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorState | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Actualiza el valor del campo
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpia el error para el campo que se está editando
    if (errors && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      await handleLogin(formData);
      // Si el login es exitoso, el AuthContext se encarga de actualizar el estado global
      // y el AuthModal se cerrará (lógica que implementaremos en AuthModal).
    } catch (err: any) {
      // El error viene del authService, lo guardamos en el estado local
      const apiErrors = err.errors || {};
      if (err.message) {
        apiErrors.form = [err.message]; // Para errores generales no asociados a un campo
      }
      setErrors(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="loginEmail">Email</label>
        <input type="email" className={styles.formInput} id="loginEmail" name="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required />
        {errors?.email && <div className={styles.errorText}>{errors.email[0]}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="loginPassword">Contraseña</label>
        <input type="password" className={styles.formInput} id="loginPassword" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
        {errors?.password && <div className={styles.errorText}>{errors.password[0]}</div>}
      </div>
      
      <div className={styles.forgotPassword}>
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>

      {/* Para errores generales del formulario */}
      {errors?.form && <div className={styles.errorText}>{errors.form[0]}</div>}

      <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
      
      <div className={styles.divider}><span>O continúa con</span></div>

      <a href={ENDPOINTS.USUARIOS.GOOGLE_LOGIN} className={styles.googleBtn}>
        <GoogleIcon />
        Continuar con Google
      </a>
    </form>
  );
};
