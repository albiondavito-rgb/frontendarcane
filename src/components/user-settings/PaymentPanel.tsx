import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMetodosPago, addMetodoPago, deleteMetodoPago } from '../../api/metodoPagoService';
import type { MetodoPago, MetodoPagoCreate } from '../../types/metodoPago.types';
import baseStyles from './Panels.module.css';
import newStyles from './PaymentPanel.module.css';
import { CreditCard, Trash2, Plus, Check, X } from 'react-feather';

// Componente para mostrar una tarjeta guardada con confirmación en línea
const SavedCard = ({ metodo, onDelete }: { metodo: MetodoPago, onDelete: (id: number) => void }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDeleteClick = () => {
    setIsConfirming(true);
  };

  const handleConfirmDelete = () => {
    onDelete(metodo.id);
    setIsConfirming(false); // Opcional: el componente se desmontará de todos modos
  };

  const handleCancelDelete = () => {
    setIsConfirming(false);
  };

  return (
    <div className={newStyles.savedCard}>
      <div className={newStyles.cardInfo}>
        <CreditCard className={newStyles.cardIcon} size={36} />
        <div className={newStyles.cardDetails}>
          <div className={newStyles.cardNumber}>
            {metodo.tipoTarjeta} terminada en {metodo.numeroTarjetaEnmascarado.slice(-4)}
          </div>
          <div className={newStyles.cardExp}>
            Expira: {String(metodo.mesExpiracion).padStart(2, '0')}/{metodo.anoExpiracion}
          </div>
        </div>
      </div>
      <div className={newStyles.deleteContainer}>
        {isConfirming ? (
          <div className={newStyles.confirmActions}>
            <button onClick={handleConfirmDelete} className={`${newStyles.confirmBtn} ${newStyles.confirmActionBtn}`} title="Confirmar">
              <Check size={22} />
            </button>
            <button onClick={handleCancelDelete} className={`${newStyles.cancelBtn} ${newStyles.confirmActionBtn}`} title="Cancelar">
              <X size={22} />
            </button>
          </div>
        ) : (
          <button onClick={handleDeleteClick} className={newStyles.deleteBtn} title="Eliminar método de pago">
            <Trash2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
};


// Componente del formulario para añadir tarjeta (con validación de backend)
const AddCardForm = ({ onCardAdded }: { onCardAdded: () => void }) => {
    const { user } = useAuth();
    const [cardData, setCardData] = useState({
        numeroTarjeta: '',
        nombreTitular: '',
        mesExpiracion: '',
        anoExpiracion: '',
        codigoPostal: '',
        cvv: ''
    });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [errors, setErrors] = useState<Partial<Record<keyof MetodoPagoCreate | 'cvv' | 'form', string>>>({});

    useEffect(() => {
        if (formStatus === 'success') {
            const timer = setTimeout(() => {
                setFormStatus('idle');
                onCardAdded(); // Llama a la función para refrescar y cerrar el form
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [formStatus, onCardAdded]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumericField = ['numeroTarjeta', 'mesExpiracion', 'anoExpiracion', 'codigoPostal', 'cvv'].includes(name);
        let processedValue = isNumericField ? value.replace(/[^0-9]/g, '') : value;
        
        setCardData(prev => ({ ...prev, [name]: processedValue }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setErrors({ form: "Debes estar autenticado para añadir una tarjeta." });
            return;
        }

        setFormStatus('loading');
        setErrors({});

        try {
            const dataToSend: MetodoPagoCreate = {
                numeroTarjeta: cardData.numeroTarjeta,
                nombreTitular: cardData.nombreTitular,
                codigoPostal: cardData.codigoPostal,
                mesExpiracion: Number(cardData.mesExpiracion),
                anoExpiracion: Number(`20${cardData.anoExpiracion}`),
            };
            await addMetodoPago(user.id, dataToSend);
            setFormStatus('success');
        } catch (err: any) {
            console.error("Error en el formulario:", err);
            if (err && err.errors) {
                const backendErrors: Record<string, string[]> = err.errors;
                const newErrors: Partial<Record<keyof MetodoPagoCreate | 'cvv', string>> = {};
                for (const key in backendErrors) {
                    const frontendKey = key.charAt(0).toLowerCase() + key.slice(1);
                    if (backendErrors[key].length > 0) {
                        newErrors[frontendKey as keyof MetodoPagoCreate] = backendErrors[key][0];
                    }
                }
                setErrors(newErrors);
            } else {
                setErrors({ form: err.message || 'Error al guardar la tarjeta. Revisa los datos.' });
            }
            setFormStatus('idle'); // En caso de error, vuelve a idle
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={baseStyles.settingsSection}>
                <h3 className={baseStyles.settingsSectionTitle}>Añadir Nueva Tarjeta</h3>
                <div className={baseStyles.creditCard}>
                    <div className={baseStyles.cardChip}></div>
                    <div className={baseStyles.cardInputGroup}>
                        <label className={baseStyles.cardLabel} htmlFor="cardNumber">Número de Tarjeta</label>
                        <input type="text" id="cardNumber" name="numeroTarjeta" className={baseStyles.cardInput} placeholder="•••• •••• •••• ••••" value={cardData.numeroTarjeta} onChange={handleChange} maxLength={16} required />
                        {errors.numeroTarjeta && <div className={baseStyles.errorText}>{errors.numeroTarjeta}</div>}
                    </div>
                    <div className={baseStyles.cardInputGroup}>
                        <label className={baseStyles.cardLabel} htmlFor="cardName">Nombre Completo</label>
                        <input type="text" id="cardName" name="nombreTitular" className={baseStyles.cardInput} placeholder="Nombre como aparece en la tarjeta" value={cardData.nombreTitular} onChange={handleChange} required />
                        {errors.nombreTitular && <div className={baseStyles.errorText}>{errors.nombreTitular}</div>}
                    </div>
                    <div className={baseStyles.cardRow}>
                        <div className={`${baseStyles.cardInputGroup} ${baseStyles.cardCol}`}>
                            <label className={baseStyles.cardLabel} htmlFor="expMonth">Exp. Mes</label>
                            <input type="text" id="expMonth" name="mesExpiracion" className={baseStyles.cardInput} placeholder="MM" value={cardData.mesExpiracion} onChange={handleChange} maxLength={2} required />
                            {errors.mesExpiracion && <div className={baseStyles.errorText}>{errors.mesExpiracion}</div>}
                        </div>
                        <div className={`${baseStyles.cardInputGroup} ${baseStyles.cardCol}`}>
                            <label className={baseStyles.cardLabel} htmlFor="expYear">Exp. Año</label>
                            <input type="text" id="expYear" name="anoExpiracion" className={baseStyles.cardInput} placeholder="YY" value={cardData.anoExpiracion} onChange={handleChange} maxLength={2} required />
                            {errors.anoExpiracion && <div className={baseStyles.errorText}>{errors.anoExpiracion}</div>}
                        </div>
                        <div className={`${baseStyles.cardInputGroup} ${baseStyles.cardCol}`}>
                            <label className={baseStyles.cardLabel} htmlFor="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" className={baseStyles.cardInput} placeholder="•••" value={cardData.cvv} onChange={handleChange} maxLength={3} required />
                        </div>
                    </div>
                </div>
                <div className={baseStyles.formGroup}>
                    <label className={baseStyles.formLabel} htmlFor="postalCode">Código Postal</label>
                    <input type="text" className={baseStyles.formInput} id="postalCode" name="codigoPostal" value={cardData.codigoPostal} onChange={handleChange} placeholder="Tu código postal" maxLength={10} required />
                    {errors.codigoPostal && <div className={baseStyles.errorText}>{errors.codigoPostal}</div>}
                </div>
            </div>
            <button 
                type="submit" 
                className={`${baseStyles.btn} ${formStatus === 'success' ? baseStyles.btnSuccess : ''}`}
                disabled={formStatus === 'loading' || formStatus === 'success'}
            >
                {formStatus === 'idle' && 'Guardar Tarjeta'}
                {formStatus === 'loading' && 'Guardando...'}
                {formStatus === 'success' && (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Check size={20} /> Guardado
                    </span>
                )}
            </button>
            {errors.form && <div className={newStyles.error} style={{padding: '1rem 0', textAlign: 'center'}}>{errors.form}</div>}
        </form>
    );
};


export const PaymentPanel = () => {
  const { user } = useAuth();
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMetodos = useCallback(async () => {
    if (user?.id) {
      try {
        setLoading(true);
        setError(null);
        const data = await getMetodosPago(user.id);
        setMetodos(data);
        if (data.length === 0) {
          setShowAddForm(true);
        }
      } catch (err) {
        setError('No se pudieron cargar los métodos de pago.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  const handleCardAdded = () => {
    setShowAddForm(false);
    fetchMetodos();
  };

  const handleDelete = async (metodoId: number) => {
    if (!user?.id) return;

    try {
        await deleteMetodoPago(user.id, metodoId);
        setMetodos(prevMetodos => prevMetodos.filter(m => m.id !== metodoId));
    } catch (err) {
        console.error(err);
        alert("Error al eliminar la tarjeta.");
    }
  };

  if (loading && metodos.length === 0) {
    return <div className={newStyles.loading}>Cargando métodos de pago...</div>;
  }

  if (error) {
    return <div className={newStyles.error}>{error}</div>;
  }

  return (
    <div>
      <div className={baseStyles.settingsSection}>
        <h3 className={baseStyles.settingsSectionTitle}>Mis Tarjetas</h3>
        {metodos.length > 0 ? (
          metodos.map(metodo => <SavedCard key={metodo.id} metodo={metodo} onDelete={handleDelete} />)
        ) : (
          !showAddForm && <p>No tienes métodos de pago guardados.</p>
        )}
        
        {metodos.length > 0 && !showAddForm && (
          <button className={newStyles.addCardBtn} onClick={() => setShowAddForm(true)}>
            <Plus size={18} />
            Agregar Nuevo Método de Pago
          </button>
        )}
      </div>

      {showAddForm && <AddCardForm onCardAdded={handleCardAdded} />}
    </div>
  );
};
