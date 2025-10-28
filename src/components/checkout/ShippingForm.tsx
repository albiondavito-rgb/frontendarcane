import React from 'react';
import styles from './Checkout.module.css';
import { MapPin } from 'react-feather';

interface ShippingFormProps {
  direccion: string;
  onChange: (direccion: string) => void;
  error?: string;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ direccion, onChange, error }) => {
  return (
    <div className={styles.formContainer}>
      <h3 className={styles.summaryHeader}>
        <MapPin size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Dirección de Entrega
      </h3>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="direccion">
          Dirección completa *
        </label>
        <textarea
          id="direccion"
          className={styles.formTextarea}
          value={direccion}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Av. Principal #123, Torre Norte, Piso 5, Depto. 502, La Paz"
          required
        />
        {error && <div className={styles.formError}>{error}</div>}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Incluye calle, número, referencias y ciudad
        </div>
      </div>
    </div>
  );
};
