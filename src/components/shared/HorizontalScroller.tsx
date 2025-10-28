import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './HorizontalScroller.module.css';
import { ChevronLeft, ChevronRight } from 'react-feather';

type HorizontalScrollerProps = {
  children: ReactNode;
};

export const HorizontalScroller = ({ children }: HorizontalScrollerProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Función para comprobar si se puede hacer scroll
  const checkScroll = () => {
    const el = scrollerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(hasOverflow && el.scrollLeft < (el.scrollWidth - el.clientWidth));
    }
  };

  // Comprobar el estado del scroll al montar y al cambiar el tamaño de la ventana
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  // Función para deslizar
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (el) {
      // Deslizamos el 75% del ancho visible
      const scrollAmount = el.clientWidth * 0.75;
      const newScrollLeft = direction === 'left' 
        ? el.scrollLeft - scrollAmount 
        : el.scrollLeft + scrollAmount;
      
      el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.scrollerContainer}>
      {/* Flecha Izquierda */}
      {canScrollLeft && (
        <button 
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scroll('left')}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Contenedor deslizable */}
      <div className={styles.scroller} ref={scrollerRef} onScroll={checkScroll}>
        <div className={styles.scrollerContent}>
          {children}
        </div>
      </div>

      {/* Flecha Derecha */}
      {canScrollRight && (
        <button 
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scroll('right')}
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
};
