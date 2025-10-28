import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { AIChatProvider } from './context/AIChatContext';
import { CartProvider } from './context/CartContext';
import { UserSettingsModalProvider } from './context/UserSettingsModalContext'; // <-- IMPORTACIÓN AÑADIDA
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <AuthModalProvider>
          <AIChatProvider>
            <CartProvider>
              <UserSettingsModalProvider>
                <RouterProvider router={router} />
              </UserSettingsModalProvider>
            </CartProvider>
          </AIChatProvider>
        </AuthModalProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);