import React, { useState } from 'react';
import styles from './Checkout.module.css';
import { CreditCard, Check, X } from 'react-feather';
import { addMetodoPago } from '../../api/metodoPagoService';
import type { MetodoPago, MetodoPagoCreate } from '../../types/metodoPago.types';

interface CreditCardFormProps {
  usuarioId: number;
  onSuccess: (metodo: MetodoPago) => void;
  onCancel: () => void;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ usuarioId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<MetodoPagoCreate>({
    numeroTarjeta: '',
    mesExpiracion: 0,
    anoExpiracion: 0,
    nombreTitular: '',
    codigoPostal: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MetodoPagoCreate, string>>>({});
  const [loading, setLoading] = useState(false);

  const detectarTipoTarjeta = (numero: string): string => {
    const primerDigito = numero.charAt(0);
    if (primerDigito === '4') return 'Visa';
    if (primerDigito === '5') return 'MasterCard';
    if (primerDigito === '3') return 'American Express';
    return 'Desconocido';
  };

  const formatearNumeroTarjeta = (valor: string): string => {
    const limpio = valor.replace(/\D/g, '');
    const grupos = limpio.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : limpio;
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\s/g, '');
    if (valor.length <= 16) {
      setFormData(prev => ({ ...prev, numeroTarjeta: valor }));
      setErrors(prev => ({ ...prev, numeroTarjeta: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors: Partial<Record<keyof MetodoPagoCreate, string>> = {};
    
    if (formData.numeroTarjeta.length < 13 || formData.numeroTarjeta.length > 19) {
      newErrors.numeroTarjeta = 'Número de tarjeta inválido';
    }
    
    if (formData.mesExpiracion < 1 || formData.mesExpiracion > 12) {
      newErrors.mesExpiracion = 'Mes inválido';
    }
    
    const anoActual = new Date().getFullYear();
    if (formData.anoExpiracion < anoActual) {
      newErrors.anoExpiracion = 'Tarjeta expirada';
    }
    
    if (!formData.nombreTitular.trim()) {
      newErrors.nombreTitular = 'Nombre requerido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const nuevoMetodo = await addMetodoPago(usuarioId, formData);
      onSuccess(nuevoMetodo);
    } catch (error: any) {
      console.error('Error al agregar método de pago:', error);
      setErrors({ numeroTarjeta: error.message || 'Error al guardar la tarjeta' });
    } finally {
      setLoading(false);
    }
  };

  const tipoTarjeta = formData.numeroTarjeta ? detectarTipoTarjeta(formData.numeroTarjeta) : '';

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="numeroTarjeta">
          <CreditCard size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Número de tarjeta *
        </label>
        <input
          type="text"
          id="numeroTarjeta"
          className={styles.formInput}
          value={formatearNumeroTarjeta(formData.numeroTarjeta)}
          onChange={handleNumeroChange}
          placeholder="1234 5678 9012 3456"
          required
        />
        {tipoTarjeta && tipoTarjeta !== 'Desconocido' && (
          <div style={{ fontSize: '0.875rem', color: 'var(--primary-color)', marginTop: '0.25rem' }}>
            {tipoTarjeta}
          </div>
        )}
        {errors.numeroTarjeta && <div className={styles.formError}>{errors.numeroTarjeta}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="mesExpiracion">
            Mes *
          </label>
          <input
            type="number"
            id="mesExpiracion"
            className={styles.formInput}
            value={formData.mesExpiracion || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, mesExpiracion: parseInt(e.target.value) || 0 }))}
            placeholder="MM"
            min="1"
            max="12"
            required
          />
          {errors.mesExpiracion && <div className={styles.formError}>{errors.mesExpiracion}</div>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="anoExpiracion">
            Año *
          </label>
          <input
            type="number"
            id="anoExpiracion"
            className={styles.formInput}
            value={formData.anoExpiracion || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, anoExpiracion: parseInt(e.target.value) || 0 }))}
            placeholder="AAAA"
            min={new Date().getFullYear()}
            required
          />
          {errors.anoExpiracion && <div className={styles.formError}>{errors.anoExpiracion}</div>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="nombreTitular">
          Nombre del titular *
        </label>
        <input
          type="text"
          id="nombreTitular"
          className={styles.formInput}
          value={formData.nombreTitular}
          onChange={(e) => setFormData(prev => ({ ...prev, nombreTitular: e.target.value.toUpperCase() }))}
          placeholder="NOMBRE APELLIDO"
          required
        />
        {errors.nombreTitular && <div className={styles.formError}>{errors.nombreTitular}</div>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="codigoPostal">
          Código postal (opcional)
        </label>
        <input
          type="text"
          id="codigoPostal"
          className={styles.formInput}
          value={formData.codigoPostal}
          onChange={(e) => setFormData(prev => ({ ...prev, codigoPostal: e.target.value }))}
          placeholder="12345"
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.btnBack}
          disabled={loading}
        >
          <X size={18} />
          Cancelar
        </button>
        <button
          type="submit"
          className={styles.btnNext}
          disabled={loading}
        >
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              Guardando...
            </div>
          ) : (
            <>
              <Check size={18} />
              Guardar tarjeta
            </>
          )}
        </button>
      </div>

      <div style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-secondary)', 
        marginTop: '1rem',
        textAlign: 'center'
      }}>
        🔒 Tu información está segura y encriptada
      </div>
    </form>
  );
};
