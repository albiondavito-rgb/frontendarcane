
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type UserSettingsModalContextType = {
  isOpen: boolean;
  activeTab: string;
  openModal: (tab?: string) => void;
  closeModal: () => void;
  setActiveTab: (tab: string) => void;
};

const UserSettingsModalContext = createContext<UserSettingsModalContextType | undefined>(undefined);

export const UserSettingsModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' como tab por defecto

  const openModal = (tab = 'profile') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <UserSettingsModalContext.Provider value={{ isOpen, activeTab, openModal, closeModal, setActiveTab }}>
      {children}
    </UserSettingsModalContext.Provider>
  );
};

export const useUserSettingsModal = () => {
  const context = useContext(UserSettingsModalContext);
  if (context === undefined) {
    throw new Error('useUserSettingsModal must be used within a UserSettingsModalProvider');
  }
  return context;
};
