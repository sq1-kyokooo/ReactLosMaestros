import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import StoreLayout from './components/StoreLayout';
import ProtectedRoute from './auth/ProtectedRoute';
import { ADMIN_PERMISSIONS } from './auth/permissions';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import MyOrdersPage from './pages/MyOrdersPage';
import NotFoundPage from './pages/NotFoundPage';

const AdminPage = lazy(() => import('./admin/AdminPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="productos" element={<CatalogPage />} />
        <Route path="productos/:code" element={<ProductDetailPage />} />
        <Route path="nosotros" element={<AboutPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="mis-compras"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route
        path="admin"
        element={
          <ProtectedRoute anyOf={ADMIN_PERMISSIONS}>
            <Suspense fallback={<p>Cargando...</p>}>
              <AdminPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  
}
