import { useState, useEffect } from 'react';

/**
 * Un hook personalizado que devuelve `true` si la media query de CSS dada coincide, y `false` en caso contrario.
 * @param {string} query - La media query a evaluar (ej. '(min-width: 768px)').
 * @returns {boolean} - Si la media query coincide o no.
 */
export const useMediaQuery = (query: string): boolean => {
  // Estado para guardar si la media query coincide o no.
  // Se inicializa con el valor actual al cargar el componente.
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    
    // Función que se ejecutará cada vez que cambie el estado de la media query (ej. al redimensionar la ventana)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Añadimos el listener
    mediaQueryList.addEventListener('change', listener);

    // Función de limpieza: se ejecuta cuando el componente se desmonta para evitar fugas de memoria.
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]); // El efecto se volverá a ejecutar si la query cambia

  return matches;
};
