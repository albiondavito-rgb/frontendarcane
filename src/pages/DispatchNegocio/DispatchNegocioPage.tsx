import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBusiness } from '../../api/negocioService';
import styles from './DispatchNegocioPage.module.css';

export const DispatchNegocioPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkBusinessStatus = async () => {
      try {
        console.log('Iniciando verificación de negocio...');
        const negocio = await getMyBusiness();

        // Log para ver qué devuelve la API
        console.log('Respuesta de getMyBusiness:', negocio);
        console.log('Valor de negocio.estado:', negocio?.estado);

        if (negocio && negocio.estado === 'Activo') {
          console.log('Redirección planeada a: /negocio/inicio');
                  // navigate('/negocio/inicio', { replace: true });        } else {
          console.log('Redirección planeada a: /registrar-negocio');
          // navigate('/registrar-negocio', { replace: true });
        }
      } catch (error) {
        console.error('Error al verificar el estado del negocio:', error);
        console.log('Redirección planeada a: /registrar-negocio debido a un error.');
        // navigate('/registrar-negocio', { replace: true });
      }
    };

    checkBusinessStatus();
  }, [navigate]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Verificando estado de tu negocio...</p>
    </div>
  );
};
