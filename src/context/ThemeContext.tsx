import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Definimos los tipos para nuestro contexto
type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Creamos el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Creamos el componente Proveedor
type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // El estado del tema, inicializado desde localStorage o por defecto en 'light'
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    // Aseguramos que el valor sea 'light' o 'dark'
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return 'light';
  });

  // Efecto que se ejecuta cada vez que el estado del tema cambia
  useEffect(() => {
    const root = document.documentElement; // La etiqueta <html>
    // 1. Eliminamos la clase anterior para evitar conflictos
    root.classList.remove('light', 'dark');
    // 2. Añadimos la clase actual
    root.setAttribute('data-theme', theme);
    // 3. Guardamos la preferencia en localStorage para futuras visitas
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
