import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const HashScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // El 'scroll-behavior: smooth' en index.css se encargará de la animación
        element.scrollIntoView();
      }
    }
  }, [location]); // El efecto se ejecuta cada vez que cambia la ubicación (incluido el hash)

  // Este componente no renderiza nada en la UI
  return null;
};
