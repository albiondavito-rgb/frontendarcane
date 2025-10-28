// Tipos para el Dashboard del emprendedor

export interface DashboardPedidosStats {
  pendientes: number;
  confirmados: number;
  enviados: number;
  entregados: number;
  rechazados: number;
  total: number;
}

export interface ProductoPorCategoria {
  categoria: string;
  cantidad: number;
}

export interface DashboardProductosStats {
  productosPorCategoria: ProductoPorCategoria[];
  totalProductosEnStock: number;
}

export interface GananciaPorCategoria {
  categoria: string;
  gananciaBruta: number;
}

export interface DashboardGananciasStats {
  gananciasPorCategoria: GananciaPorCategoria[];
  comisionTotalPagada: number;
  gananciaBrutaTotal: number;
}

export interface DashboardCarritosStats {
  pagados: number;
  abandonados: number;
  activos: number;
  total: number;
}
