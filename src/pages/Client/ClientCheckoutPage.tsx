import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ClientCheckoutPage.module.css';
import { CheckoutSteps } from '../../components/checkout/CheckoutSteps';
import { CheckoutSummary } from '../../components/checkout/CheckoutSummary';
import { ShippingForm } from '../../components/checkout/ShippingForm';
import { PaymentSelector } from '../../components/checkout/PaymentSelector';
import { InvoiceForm } from '../../components/checkout/InvoiceForm';
import { QRPaymentModal } from '../../components/checkout/QRPaymentModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { processCheckout } from '../../api/checkoutService';
import { ArrowLeft, ArrowRight } from 'react-feather';
import type { DatosFactura, CheckoutData } from '../../types/checkout.types';
import type { MetodoPago } from '../../types/metodoPago.types';

const STEPS = ['Resumen', 'Entrega', 'Pago', 'Facturación'];

export const ClientCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, carritoId } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Datos del formulario
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState<'QR' | 'Tarjeta'>('QR');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoPago | null>(null);
  const [datosFactura, setDatosFactura] = useState<DatosFactura>({
    nombre: '',
    ciNit: '',
    correo: '',
    numero: '',
  });

  // Errores de validación
  const [errors, setErrors] = useState<{
    direccion?: string;
    factura?: Partial<Record<keyof DatosFactura, string>>;
  }>({});

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/explorar');
    }
  }, [cartItems, navigate]);

  // Pre-llenar datos si el usuario está logueado
  useEffect(() => {
    if (user) {
      setDatosFactura(prev => ({
        ...prev,
        nombre: user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : '',
        correo: user.email || '',
        numero: user.telefono || '',
      }));
    }
  }, [user]);

  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};

    if (step === 2) {
      if (!direccionEntrega.trim() || direccionEntrega.length < 10) {
        newErrors.direccion = 'La dirección debe tener al menos 10 caracteres';
      }
    }

    if (step === 3) {
      if (metodoPago === 'Tarjeta' && !metodoSeleccionado) {
        alert('Por favor selecciona o agrega un método de pago');
        return false;
      }
    }

    if (step === 4) {
      const facturaErrors: Partial<Record<keyof DatosFactura, string>> = {};
      
      if (!datosFactura.nombre.trim()) {
        facturaErrors.nombre = 'Nombre requerido';
      }
      if (!datosFactura.ciNit.trim()) {
        facturaErrors.ciNit = 'CI/NIT requerido';
      }
      if (!datosFactura.correo.trim() || !datosFactura.correo.includes('@')) {
        facturaErrors.correo = 'Correo válido requerido';
      }
      if (!datosFactura.numero.trim()) {
        facturaErrors.numero = 'Teléfono requerido';
      }

      if (Object.keys(facturaErrors).length > 0) {
        newErrors.factura = facturaErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    // Validar que tenemos el carritoId
    if (!carritoId) {
      alert('Error: No se pudo obtener el ID del carrito. Por favor recarga la página.');
      return;
    }

    const checkoutData: CheckoutData = {
      carritoId: carritoId,
      metodoPago,
      datosFactura,
      direccionEntrega,
      usuarioId: user?.id,
    };

    if (metodoPago === 'QR') {
      // Mostrar modal de QR
      setShowQRModal(true);
    } else {
      // Procesar directamente con tarjeta
      await procesarPago(checkoutData);
    }
  };

  const procesarPago = async (checkoutData: CheckoutData) => {
    try {
      setLoading(true);
      const resultado = await processCheckout(checkoutData);
      
      // Limpiar carrito
      clearCart();
      
      // Redirigir a confirmación
      navigate(`/pedido/confirmacion/${resultado.pedidoId}`);
    } catch (error: any) {
      console.error('Error en checkout:', error);
      alert(error.message || 'Error al procesar el pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRPaymentSuccess = async () => {
    if (!carritoId) return;

    const checkoutData: CheckoutData = {
      carritoId: carritoId,
      metodoPago: 'QR',
      datosFactura,
      direccionEntrega,
      usuarioId: user?.id,
    };
    
    setShowQRModal(false);
    await procesarPago(checkoutData);
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.checkoutPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Finalizar Compra</h1>

        <CheckoutSteps currentStep={currentStep} steps={STEPS} />

        {/* PASO 1: Resumen */}
        {currentStep === 1 && (
          <>
            <CheckoutSummary items={cartItems} total={cartTotal} />
            <div className={styles.navigation}>
              <button onClick={() => navigate('/explorar')} className={styles.btnBack}>
                <ArrowLeft size={18} />
                Seguir Comprando
              </button>
              <button onClick={handleNext} className={styles.btnNext}>
                Continuar
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* PASO 2: Dirección */}
        {currentStep === 2 && (
          <>
            <CheckoutSummary items={cartItems} total={cartTotal} />
            <ShippingForm
              direccion={direccionEntrega}
              onChange={setDireccionEntrega}
              error={errors.direccion}
            />
            <div className={styles.navigation}>
              <button onClick={handleBack} className={styles.btnBack}>
                <ArrowLeft size={18} />
                Atrás
              </button>
              <button onClick={handleNext} className={styles.btnNext}>
                Continuar
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* PASO 3: Método de Pago */}
        {currentStep === 3 && (
          <>
            <CheckoutSummary items={cartItems} total={cartTotal} />
            <PaymentSelector
              metodoPago={metodoPago}
              onChange={setMetodoPago}
              metodoSeleccionado={metodoSeleccionado}
              onMetodoSeleccionado={setMetodoSeleccionado}
              usuarioId={user?.id}
            />
            <div className={styles.navigation}>
              <button onClick={handleBack} className={styles.btnBack}>
                <ArrowLeft size={18} />
                Atrás
              </button>
              <button onClick={handleNext} className={styles.btnNext}>
                Continuar
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* PASO 4: Datos de Facturación */}
        {currentStep === 4 && (
          <>
            <CheckoutSummary items={cartItems} total={cartTotal} />
            <InvoiceForm
              datos={datosFactura}
              onChange={setDatosFactura}
              errors={errors.factura}
            />
            <div className={styles.navigation}>
              <button onClick={handleBack} className={styles.btnBack}>
                <ArrowLeft size={18} />
                Atrás
              </button>
              <button onClick={handleSubmit} className={styles.btnSubmit} disabled={loading}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Procesando...
                  </div>
                ) : (
                  `Confirmar Pedido - $${cartTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal de pago QR */}
      {showQRModal && (
        <QRPaymentModal
          monto={cartTotal}
          onSuccess={handleQRPaymentSuccess}
          onCancel={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
};
