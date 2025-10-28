import React, { useState, useEffect } from 'react';
import styles from './Checkout.module.css';
import { CreditCard, Smartphone, Plus } from 'react-feather';
import { getMetodosPago } from '../../api/metodoPagoService';
import { CreditCardForm } from './CreditCardForm';
import type { MetodoPago } from '../../types/metodoPago.types';

interface PaymentSelectorProps {
  metodoPago: 'QR' | 'Tarjeta';
  onChange: (metodo: 'QR' | 'Tarjeta') => void;
  metodoSeleccionado?: MetodoPago | null;
  onMetodoSeleccionado?: (metodo: MetodoPago | null) => void;
  usuarioId?: number;
}

export const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  metodoPago,
  onChange,
  metodoSeleccionado,
  onMetodoSeleccionado,
  usuarioId,
}) => {
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuarioId && metodoPago === 'Tarjeta') {
      loadMetodosPago();
    }
  }, [usuarioId, metodoPago]);

  const loadMetodosPago = async () => {
    if (!usuarioId) return;
    
    try {
      setLoading(true);
      const metodos = await getMetodosPago(usuarioId);
      setMetodosPago(metodos);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetodoGuardadoSelect = (metodo: MetodoPago) => {
    onMetodoSeleccionado?.(metodo);
  };

  const handleNuevoMetodoCreado = (nuevoMetodo: MetodoPago) => {
    setMetodosPago(prev => [...prev, nuevoMetodo]);
    setMostrarFormulario(false);
    onMetodoSeleccionado?.(nuevoMetodo);
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.summaryHeader}>
        <CreditCard size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
        Método de Pago
      </h3>

      {/* Opciones de método de pago */}
      <div className={styles.paymentOptions}>
        <div
          className={`${styles.paymentOption} ${metodoPago === 'QR' ? styles.selected : ''}`}
          onClick={() => onChange('QR')}
        >
          <Smartphone size={32} className={styles.paymentIcon} />
          <span className={styles.paymentLabel}>Pago QR</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Escanea y paga
          </span>
        </div>

        <div
          className={`${styles.paymentOption} ${metodoPago === 'Tarjeta' ? styles.selected : ''}`}
          onClick={() => onChange('Tarjeta')}
        >
          <CreditCard size={32} className={styles.paymentIcon} />
          <span className={styles.paymentLabel}>Tarjeta</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Débito o crédito
          </span>
        </div>
      </div>

      {/* Si selecciona Tarjeta, mostrar opciones */}
      {metodoPago === 'Tarjeta' && usuarioId && (
        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Cargando métodos de pago...
            </div>
          ) : (
            <>
              {/* Métodos guardados */}
              {metodosPago.length > 0 && !mostrarFormulario && (
                <div className={styles.savedMethods}>
                  {metodosPago.map((metodo) => (
                    <div
                      key={metodo.id}
                      className={`${styles.savedMethod} ${metodoSeleccionado?.id === metodo.id ? styles.selected : ''}`}
                      onClick={() => handleMetodoGuardadoSelect(metodo)}
                    >
                      <div className={styles.methodInfo}>
                        <CreditCard size={24} className={styles.cardIcon} />
                        <div className={styles.methodDetails}>
                          <div className={styles.methodNumber}>
                            {metodo.tipoTarjeta} {metodo.numeroTarjetaEnmascarado}
                          </div>
                          <div className={styles.methodExpiry}>
                            Vence: {metodo.mesExpiracion.toString().padStart(2, '0')}/{metodo.anoExpiracion}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para agregar nuevo método o mostrar formulario */}
              {!mostrarFormulario ? (
                <button
                  className={styles.addNewMethod}
                  onClick={() => setMostrarFormulario(true)}
                >
                  <Plus size={20} />
                  Agregar nueva tarjeta
                </button>
              ) : (
                <CreditCardForm
                  usuarioId={usuarioId}
                  onSuccess={handleNuevoMetodoCreado}
                  onCancel={() => setMostrarFormulario(false)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Mensaje para QR */}
      {metodoPago === 'QR' && (
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(var(--primary-rgb), 0.1)', 
          borderRadius: '8px',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          marginTop: '1rem'
        }}>
          💡 Recibirás un código QR para completar el pago al finalizar el pedido
        </div>
      )}
    </div>
  );
};
