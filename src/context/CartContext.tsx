import { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product'; // Importamos el tipo Product
import type { ToastType } from '../components/notifications/Toast';
import { getCarrito, addProductToCarrito, updateCarritoQuantity, deleteCarritoItem, clearCarrito } from '../api/carritoService';
import type { CarritoDto } from '../types/carrito.types';
import { useAuth } from './AuthContext';

// Define la "forma" de un item en el carrito
export type CartItem = {
  product: Product;
  quantity: number;
};

// Helper para convertir CarritoDto del backend a CartItem del frontend
const convertBackendToFrontend = (carritoDto: CarritoDto): CartItem[] => {
  return carritoDto.items.map(item => ({
    product: {
      id: item.productoId,
      nombre: item.nombreProducto,
      descripcion: '',
      precio: item.precioUnitario,
      imagenUrl: item.imagenProducto,
      cantidadStock: item.stockDisponible,
      estado: 'Activo',
      categoriaId: 0,
      negocioId: 0,
      nombreNegocio: item.nombreNegocio,
      nombreCategoria: '',
      estaActivo: true,
    } as Product,
    quantity: item.cantidad,
  }));
};

// Define la "forma" de todo lo que nuestro contexto proveerá
type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  itemCount: number;
  cartTotal: number;
  carritoId: number | null;
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string, type: ToastType) => void;
};

// Creamos el Contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Creamos el componente Proveedor
type CartProviderProps = {
  children: ReactNode;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user } = useAuth(); // Obtener usuario del AuthContext
  const usuarioId = user?.id;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastCallback, setToastCallback] = useState<((message: string, type: ToastType) => void) | null>(null);
  const [carritoId, setCarritoId] = useState<number | null>(null);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Cargar carrito del backend al montar o cuando cambie usuarioId
  useEffect(() => {
    const loadCarrito = async () => {
      try {
        const carritoData = await getCarrito(usuarioId);
        setCarritoId(carritoData.id);
        setCartItems(convertBackendToFrontend(carritoData));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    };

    loadCarrito();
  }, [usuarioId]);
  
  const clearCart = useCallback(async () => {
    if (!usuarioId) return;
    try {
      await clearCarrito(usuarioId);
      setCartItems([]);
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  }, [usuarioId]);

  const showToast = useCallback((message: string, type: ToastType) => {
    if (toastCallback) {
      toastCallback(message, type);
    }
  }, [toastCallback]);

  // Método para que componentes externos registren su función de toast
  const registerToast = useCallback((callback: (message: string, type: ToastType) => void) => {
    setToastCallback(() => callback);
  }, []);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      // Agregar al backend
      const carritoData = await addProductToCarrito(
        { productoId: product.id, cantidad: quantity },
        usuarioId
      );
      
      // Actualizar estado local con respuesta del backend
      setCarritoId(carritoData.id);
      setCartItems(convertBackendToFrontend(carritoData));
      
      // Abrir el carrito automáticamente después de añadir
      openCart();
    } catch (error: any) {
      console.error('Error al agregar producto:', error);
      showToast(error.message || 'Error al agregar producto', 'error');
    }
  }, [usuarioId, openCart]);

  const increaseQuantity = useCallback(async (productId: number) => {
    try {
      const item = cartItems.find(i => i.product.id === productId);
      if (!item) return;

      const nuevaCantidad = item.quantity + 1;
      
      // Actualizar en backend
      const carritoData = await updateCarritoQuantity(
        { productoId: productId, cantidad: nuevaCantidad },
        usuarioId
      );
      
      // Actualizar estado local
      setCartItems(convertBackendToFrontend(carritoData));
    } catch (error: any) {
      console.error('Error al aumentar cantidad:', error);
      showToast(error.message || 'Error al actualizar cantidad', 'error');
    }
  }, [cartItems, usuarioId, showToast]);

  const decreaseQuantity = useCallback(async (productId: number) => {
    try {
      const item = cartItems.find(i => i.product.id === productId);
      if (!item) return;

      const nuevaCantidad = item.quantity - 1;
      
      if (nuevaCantidad <= 0) {
        // Si llega a 0, eliminar el item
        const removeFromCartFn = async (productId: number) => {
          try {
            const carritoData = await getCarrito(usuarioId);
            const backendItem = carritoData.items.find(i => i.productoId === productId);
            
            if (backendItem) {
              await deleteCarritoItem(backendItem.id, usuarioId);
              const nuevoCarrito = await getCarrito(usuarioId);
              setCartItems(convertBackendToFrontend(nuevoCarrito));
            }
          } catch (error: any) {
            console.error('Error al eliminar producto:', error);
          }
        };
        await removeFromCartFn(productId);
        return;
      }
      
      // Actualizar en backend
      const carritoData = await updateCarritoQuantity(
        { productoId: productId, cantidad: nuevaCantidad },
        usuarioId
      );
      
      // Actualizar estado local
      setCartItems(convertBackendToFrontend(carritoData));
    } catch (error: any) {
      console.error('Error al disminuir cantidad:', error);
      showToast(error.message || 'Error al actualizar cantidad', 'error');
    }
  }, [cartItems, usuarioId, showToast]);

  const removeFromCart = useCallback(async (productId: number) => {
    try {
      // Encontrar el item para obtener su ID en el carrito
      const item = cartItems.find(i => i.product.id === productId);
      if (!item) return;

      // En el backend necesitamos el itemId, que deberíamos guardar
      // Por ahora, volvemos a cargar el carrito después de eliminar
      const carritoData = await getCarrito(usuarioId);
      const backendItem = carritoData.items.find(i => i.productoId === productId);
      
      if (backendItem) {
        await deleteCarritoItem(backendItem.id, usuarioId);
        
        // Recargar carrito
        const nuevoCarrito = await getCarrito(usuarioId);
        setCartItems(convertBackendToFrontend(nuevoCarrito));
      }
    } catch (error: any) {
      console.error('Error al eliminar producto:', error);
      showToast(error.message || 'Error al eliminar producto', 'error');
    }
  }, [cartItems, usuarioId]);

  // Calculamos el número total de items y el precio total.
  // `useMemo` es una optimización: estos valores solo se recalcularán si `cartItems` cambia.
  const itemCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.precio * item.quantity, 0);
  }, [cartItems]);

  // El valor que será accesible por todos los componentes hijos
  const value = {
    cartItems,
    isCartOpen,
    itemCount,
    cartTotal,
    carritoId,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    showToast,
    registerToast,
  } as CartContextType & { registerToast: (callback: (message: string, type: ToastType) => void) => void };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para un acceso fácil y seguro al contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
