const API_DOMAIN = import.meta.env.VITE_API_URL; // Dominio base del backend
const API_BASE_URL = `${API_DOMAIN}/api`; // URL para los endpoints de la API

export { API_DOMAIN }; // Exportamos el dominio para usarlo en las imágenes

export const ENDPOINTS = {
    USUARIOS: {
        REGISTER: `${API_BASE_URL}/usuarios/register`,
        LOGIN: `${API_BASE_URL}/usuarios/login`,
        LOGOUT: `${API_BASE_URL}/usuarios/logout`,
        GOOGLE_LOGIN: `${API_BASE_URL}/usuarios/google-login`,
        ME: `${API_BASE_URL}/usuarios/me`,
        UPDATE_EMAIL: (usuarioId: number) => `${API_BASE_URL}/usuarios/${usuarioId}/email`,
        UPDATE_PASSWORD: (usuarioId: number) => `${API_BASE_URL}/usuarios/${usuarioId}/contrasena`,
        UPDATE_TELEFONO: (usuarioId: number) => `${API_BASE_URL}/usuarios/${usuarioId}/telefono`,
        FIND_BY_EMAIL: (email: string) => `${API_BASE_URL}/usuarios/by-email/${email}`,
    },
    NEGOCIOS: {
        REGISTER: (usuarioId: number) => `${API_BASE_URL}/negocios/${usuarioId}`,
        GET_ALL: `${API_BASE_URL}/Publico/negocios/principales`, // Devuelve TODOS los negocios aprobados
        GET_PRINCIPALES: `${API_BASE_URL}/Publico/negocios/principales`,
        GET_MY_NEGOCIO: `${API_BASE_URL}/negocios/me`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/negocios/${id}`,
        UPDATE: (id: number) => `${API_BASE_URL}/negocios/${id}`,
        PENDIENTES: `${API_BASE_URL}/negocios/pendientes`,
        APROBAR: (id: number) => `${API_BASE_URL}/negocios/${id}/aprobar`,
        RECHAZAR: (id: number) => `${API_BASE_URL}/negocios/${id}/rechazar`,
        DELETE_MY_NEGOCIO: `${API_BASE_URL}/Negocios/mi-negocio`,
    },
    PRODUCTOS: {
        GET_ALL: `${API_BASE_URL}/productos`,
        GET_PRINCIPALES: `${API_BASE_URL}/Publico/productos/principales`,
        GET_BY_NEGOCIO: (negocioId: number) => `${API_BASE_URL}/productos/negocio/${negocioId}`,
        CREATE: `${API_BASE_URL}/productos`,
        UPDATE: (id: number) => `${API_BASE_URL}/productos/${id}`,
        DELETE: (id: number) => `${API_BASE_URL}/productos/${id}`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/productos/${id}`,
    },
    CATEGORIAS: {
        GET_ALL: `${API_BASE_URL}/Publico/categorias`, // Devuelve TODAS las categorías activas
        GET_PRINCIPALES: `${API_BASE_URL}/Publico/categorias/principales`, // Solo las primeras 6
        ADMIN_GET_ALL: `${API_BASE_URL}/categorias`,
        CREATE: `${API_BASE_URL}/categorias`,
        UPDATE: (id: number) => `${API_BASE_URL}/categorias/${id}`,
        DELETE: (id: number) => `${API_BASE_URL}/categorias/${id}`,
        ACTIVATE: (id: number) => `${API_BASE_URL}/categorias/${id}/activate`,
    },
    METODOS_PAGO: {
        BASE: (clienteId: number) => `${API_BASE_URL}/clientes/${clienteId}/metodospago`,
        DELETE: (clienteId: number, metodoId: number) => `${API_BASE_URL}/clientes/${clienteId}/metodospago/${metodoId}`,
    },
    ADMIN: {
        USUARIOS: {
            GET_ALL: `${API_BASE_URL}/admin/usuarios`,
            CREATE: `${API_BASE_URL}/admin/usuarios`,
            UPDATE: (id: number) => `${API_BASE_URL}/admin/usuarios/${id}`,
            DELETE: (id: number) => `${API_BASE_URL}/admin/usuarios/${id}`,
        },
        NEGOCIOS: {
            GET_ALL: `${API_BASE_URL}/admin/negocios`,
            DELETE: (id: number) => `${API_BASE_URL}/admin/negocios/${id}`,
        },
        PEDIDOS: {
            GET_ALL: `${API_BASE_URL}/admin/pedidos`,
        },
    },
    PEDIDOS: {
        GET_DETALLE: (id: number) => `${API_BASE_URL}/Pedidos/${id}`,
        GET_BY_USUARIO: (usuarioId: number) => `${API_BASE_URL}/Pedidos/usuario/${usuarioId}`,
        GET_BY_NEGOCIO: (negocioId: number) => `${API_BASE_URL}/Pedidos/negocio/${negocioId}`,
        UPDATE_ESTADO: (pedidoNegocioId: number) => `${API_BASE_URL}/Pedidos/negocio/${pedidoNegocioId}/estado`,
        CHECKOUT: `${API_BASE_URL}/Pedidos/checkout`,
        GET_HISTORIAL_DETALLE: (usuarioId: number, pedidoId: number) => `${API_BASE_URL}/Pedidos/usuario/${usuarioId}/historial/${pedidoId}`,
    },
    DASHBOARD: {
        GET_PEDIDOS_STATS: (negocioId: number) => `${API_BASE_URL}/dashboard/negocio/${negocioId}/pedidos`,
        GET_PRODUCTOS_STATS: (negocioId: number) => `${API_BASE_URL}/dashboard/negocio/${negocioId}/productos`,
        GET_GANANCIAS_STATS: (negocioId: number) => `${API_BASE_URL}/dashboard/negocio/${negocioId}/ganancias`,
        GET_CARRITOS_STATS: (negocioId: number) => `${API_BASE_URL}/dashboard/negocio/${negocioId}/carritos`,
    },
    RESENAS: {
        CREATE: `${API_BASE_URL}/resenas`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/resenas/${id}`,
        GET_BY_PRODUCTO: (productoId: number) => `${API_BASE_URL}/resenas/producto/${productoId}`,
    },
    TRABAJADORES: {
        CREATE: (emprendedorId: number) => `${API_BASE_URL}/trabajadores/${emprendedorId}`,
        GET_BY_NEGOCIO: (negocioId: number) => `${API_BASE_URL}/trabajadores/negocio/${negocioId}`,
        GET_BY_ID: (id: number) => `${API_BASE_URL}/trabajadores/${id}`,
        DELETE: (id: number, emprendedorId: number) => `${API_BASE_URL}/trabajadores/${id}/emprendedor/${emprendedorId}`,
    },
    CARRITO: {
        GET: (usuarioId?: number) => `${API_BASE_URL}/carrito${usuarioId ? `?usuarioId=${usuarioId}` : ''}`,
        ADD_PRODUCT: (usuarioId?: number) => `${API_BASE_URL}/carrito${usuarioId ? `?usuarioId=${usuarioId}` : ''}`,
        UPDATE_QUANTITY: (usuarioId?: number) => `${API_BASE_URL}/carrito${usuarioId ? `?usuarioId=${usuarioId}` : ''}`,
        DELETE_ITEM: (itemId: number, usuarioId?: number) => `${API_BASE_URL}/carrito/item/${itemId}${usuarioId ? `?usuarioId=${usuarioId}` : ''}`,
        CLEAR: (usuarioId?: number) => `${API_BASE_URL}/carrito/vaciar${usuarioId ? `?usuarioId=${usuarioId}` : ''}`,
    },
    FACTURAS: {
        GET_BY_PEDIDO: (pedidoId: number) => `${API_BASE_URL}/facturas/pedido/${pedidoId}`,
        GET_PDF_BY_PEDIDO: (pedidoId: number) => `${API_BASE_URL}/facturas/pedido/${pedidoId}/pdf`,
    },
    AI: {
        CHAT: `${API_BASE_URL}/ai-specialized/chat`,
    },
    PUBLICO: {
        GLOBAL_SEARCH: `${API_BASE_URL}/Publico/global-search`,
    }
    // Aquí se podrán añadir otros recursos en el futuro (ej. HUESPEDES, etc.)
};