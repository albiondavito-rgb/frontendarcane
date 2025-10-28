import React, { useState, useEffect } from 'react';
import styles from './QRPaymentModal.module.css';
import { X, CheckCircle, XCircle } from 'react-feather';

interface QRPaymentModalProps {
  monto: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({ monto, onSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onCancel();
    }
  }, [timeLeft, onCancel]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimularExito = async () => {
    setProcessing(true);
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSuccess();
  };

  const handleSimularFallo = () => {
    alert('❌ Pago rechazado. Por favor intenta de nuevo.');
    onCancel();
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Pago con QR</h2>
          <div className={styles.timer}>
            Tiempo restante: {formatTime(timeLeft)}
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* QR Code simulado */}
          <div className={styles.qrContainer}>
            <div className={styles.qrCode}>
              <div className={styles.qrPattern}>
                {/* Patrón simulado de QR */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className={styles.qrRow}>
                    {Array.from({ length: 15 }).map((_, j) => (
                      <div
                        key={j}
                        className={styles.qrCell}
                        style={{
                          background: Math.random() > 0.5 ? '#000' : '#fff',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.qrLabel}>Escanea este código QR</div>
          </div>

          {/* Información del pago */}
          <div className={styles.paymentInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Monto a pagar:</span>
              <span className={styles.infoValue}>${monto.toFixed(2)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Código de referencia:</span>
              <span className={styles.infoValue}>
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Instrucciones */}
          <div className={styles.instructions}>
            <p>📱 Abre tu aplicación de banca móvil</p>
            <p>📷 Escanea el código QR</p>
            <p>✅ Confirma el pago</p>
          </div>

          {/* Botones de simulación */}
          <div className={styles.simulationBtns}>
            <button
              className={styles.btnSuccess}
              onClick={handleSimularExito}
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className={styles.spinner} />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Simular Pago Exitoso
                </>
              )}
            </button>
            <button
              className={styles.btnError}
              onClick={handleSimularFallo}
              disabled={processing}
            >
              <XCircle size={20} />
              Simular Pago Fallido
            </button>
          </div>

          <div className={styles.disclaimer}>
            ⚠️ Esto es una simulación de pago. En producción se integraría con un proveedor real de pagos QR.
          </div>
        </div>
      </div>
    </div>
  );
};
