
import React from 'react';
import { createPortal } from 'react-dom';
import styles from './UserSettingsModal.module.css';
import { useUserSettingsModal } from '../../context/UserSettingsModalContext';
import { X } from 'react-feather';

// Importar los paneles
import { ProfilePanel } from '../user-settings/ProfilePanel';
import { SecurityPanel } from '../user-settings/SecurityPanel';
import { PaymentPanel } from '../user-settings/PaymentPanel';
import { RegisterBusinessPanel } from '../user-settings/RegisterBusinessPanel';
import { HistoryPanel } from '../user-settings/HistoryPanel';
import { OrdersPanel } from '../user-settings/OrdersPanel';

const panelMap: { [key: string]: React.ComponentType } = {
  profile: ProfilePanel,
  security: SecurityPanel,
  payment: PaymentPanel,
  registerBusiness: RegisterBusinessPanel,
  history: HistoryPanel,
  orders: OrdersPanel,
};

const panelOptions = [
  { value: 'profile', label: 'Cuenta' },
  { value: 'security', label: 'Seguridad' },
  { value: 'payment', label: 'Formas de Pago' },
  { value: 'registerBusiness', label: 'Registrar mi Negocio' },
  { value: 'orders', label: 'Pedidos' },
  { value: 'history', label: 'Historial de Compras' },
];

export const UserSettingsModal = () => {
  const { isOpen, closeModal, activeTab, setActiveTab } = useUserSettingsModal();

  const ActivePanel = panelMap[activeTab] || ProfilePanel; // Panel por defecto

  if (!isOpen) {
    return null;
  }

  const handleTabChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTab(event.target.value);
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <>
      <div 
        className={`${styles.modalOverlay} ${isOpen ? styles.active : ''}`}
        onClick={closeModal}
      ></div>
      <div className={`${styles.userSettingsModal} ${isOpen ? styles.active : ''}`}>
        <div className={styles.settingsHeader}>
          <select 
            className={styles.settingsCombobox}
            value={activeTab}
            onChange={handleTabChange}
          >
            {panelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className={styles.closeSettings} onClick={closeModal} aria-label="Cerrar configuración">
            <X size={24} />
          </button>
        </div>
        <div className={styles.settingsContent}>
          <ActivePanel />
        </div>
      </div>
    </>,
    modalRoot
  );
};
