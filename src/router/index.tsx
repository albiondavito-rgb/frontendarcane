import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { HomePage } from "../pages/Home/HomePage";
import { ClientExplorePage } from "../pages/Client/ClientExplorePage";
import { ClientCheckoutPage } from "../pages/Client/ClientCheckoutPage";
import { ClientOrderConfirmationPage } from "../pages/Client/ClientOrderConfirmationPage";
import { ClientOrdersPage } from "../pages/Client/ClientOrdersPage";
import { ClientOrderDetailPage } from "../pages/Client/ClientOrderDetailPage";
import { BusinessLayout } from "../pages/Business/BusinessLayout";
import { BusinessHomePage } from "../pages/Business/BusinessHomePage";
import { BusinessPedidosPage } from "../pages/Business/BusinessPedidosPage";
import { BusinessProductosPage } from "../pages/Business/BusinessProductosPage";
import { BusinessVentasPage } from "../pages/Business/BusinessVentasPage";
import { BusinessResenasPage } from "../pages/Business/BusinessResenasPage";
import { BusinessTrabajadoresPage } from "../pages/Business/BusinessTrabajadoresPage";
import { BusinessConfiguracionPage } from "../pages/Business/BusinessConfiguracionPage";
import { DispatchNegocioPage } from "../pages/DispatchNegocio/DispatchNegocioPage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { AdminLayout } from "../pages/Admin/AdminLayout";
import PendingBusinessesPage from "../pages/Admin/PendingBusinessesPage";
import CategoriesManagerPage from "../pages/Admin/CategoriesManagerPage";
import UsersManagerPage from "../pages/Admin/UsersManagerPage";
import BusinessesManagerPage from "../pages/Admin/BusinessesManagerPage";
import TransactionsHistoryPage from "../pages/Admin/TransactionsHistoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // Esta ruta se renderizará en el Outlet de App cuando la ruta sea "/"
        element: <HomePage />,
      },
      {
        path: "explorar",
        element: <ClientExplorePage />,
      },
      {
        path: "checkout",
        element: <ClientCheckoutPage />,
      },
      {
        path: "pedido/confirmacion/:pedidoId",
        element: <ClientOrderConfirmationPage />,
      },
      {
        path: "mis-pedidos",
        element: <ClientOrdersPage />,
      },
      {
        path: "pedido/:pedidoId",
        element: <ClientOrderDetailPage />,
      },
      {
        path: "dispatch-negocio",
        element: <DispatchNegocioPage />,
      },
      {
        path: "panel/admin",
        element: (
          <ProtectedRoute requiredRoles={['Administrador']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <PendingBusinessesPage />
          },
          {
            path: "pending-businesses",
            element: <PendingBusinessesPage />
          },
          {
            path: "categories-manager",
            element: <CategoriesManagerPage />
          },
          {
            path: "users-manager",
            element: <UsersManagerPage />
          },
          {
            path: "businesses-manager",
            element: <BusinessesManagerPage />
          },
          {
            path: "transactions-history",
            element: <TransactionsHistoryPage />
          },
        ]
      },
      {
        path: "negocio",
        element: (
          <ProtectedRoute requiresBusiness={true}>
            <BusinessLayout />
          </ProtectedRoute>
        ),
        // Aquí irían rutas protegidas que verifiquen la autenticación y el rol de dueño de negocio
        children: [
            {
                path: "inicio",
                element: <BusinessHomePage />,
            },
            {
                path: "pedidos",
                element: <BusinessPedidosPage />,
            },
            {
                path: "productos",
                element: <BusinessProductosPage />,
            },
            {
                path: "ventas",
                element: <BusinessVentasPage />,
            },
            {
                path: "resenas",
                element: <BusinessResenasPage />,
            },
            {
                path: "trabajadores",
                element: <BusinessTrabajadoresPage />,
            },
            {
                path: "configuracion",
                element: <BusinessConfiguracionPage />,
            },
        ]
      }
    ],
  }
]);