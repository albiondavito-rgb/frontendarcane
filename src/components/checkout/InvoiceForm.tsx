import React from 'react';
import styles from './Checkout.module.css';
import { FileText } from 'react-feather';
import type { DatosFactura } from '../../types/checkout.types';

interface InvoiceFormProps {
  datos: DatosFactura;
  onChange: (datos: DatosFactura) => void;
  errors?: Partial<Record<keyof DatosFactura, string>>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ datos, onChange, errors }) => {
  const handleChange = (field: keyof DatosFactura, value: string) => {
    onChange({ ...datos, [field]: value });
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.summaryHeader}>
        <FileText size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Datos de Facturación
      </h3>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="nombre">
          Nombre completo *
        </label>
        <input
          type="text"
          id="nombre"
          className={styles.formInput}
          value={datos.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          placeholder="Ej: Juan Pérez García"
          required
        />
        {errors?.nombre && <div className={styles.formError}>{errors.nombre}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="ciNit">
          CI/NIT *
        </label>
        <input
          type="text"
          id="ciNit"
          className={styles.formInput}
          value={datos.ciNit}
          onChange={(e) => handleChange('ciNit', e.target.value)}
          placeholder="Ej: 1234567 LP o 1234567890"
          required
        />
        {errors?.ciNit && <div className={styles.formError}>{errors.ciNit}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="correo">
          Correo electrónico *
        </label>
        <input
          type="email"
          id="correo"
          className={styles.formInput}
          value={datos.correo}
          onChange={(e) => handleChange('correo', e.target.value)}
          placeholder="Ej: correo@ejemplo.com"
          required
        />
        {errors?.correo && <div className={styles.formError}>{errors.correo}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="numero">
          Teléfono *
        </label>
        <input
          type="tel"
          id="numero"
          className={styles.formInput}
          value={datos.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          placeholder="Ej: +591 70123456"
          required
        />
        {errors?.numero && <div className={styles.formError}>{errors.numero}</div>}
      </div>
    </div>
  );
};
