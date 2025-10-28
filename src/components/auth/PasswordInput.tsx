import { useState } from 'react';
import styles from './AuthModal.module.css';
import { Eye, EyeOff } from 'react-feather';

type PasswordInputProps = {
  id: string;
  placeholder: string;
  label: string;
  required?: boolean;
};

export const PasswordInput = ({ id, placeholder, label, required = true }: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel} htmlFor={id}>{label}</label>
      <div className={styles.passwordContainer}>
        <input
          type={isVisible ? 'text' : 'password'}
          className={styles.formInput}
          id={id}
          placeholder={placeholder}
          required={required}
        />
        <button type="button" className={styles.togglePassword} onClick={() => setIsVisible(!isVisible)} title={isVisible ? 'Hide password' : 'Show password'}>
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};
