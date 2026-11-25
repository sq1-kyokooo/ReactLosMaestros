import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { usePermissions } from './PermissionsContext';
import { hasAnyPermission, type PermissionName } from './permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  anyOf?: PermissionName[];
}

export default function ProtectedRoute({ children, anyOf = [] }: ProtectedRouteProps) {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth0();
  const { permissions, isLoading: arePermissionsLoading } = usePermissions();
  const { pathname } = useLocation();

  if (isAuthLoading || arePermissionsLoading) {
    return <p>Cargando...</p>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: pathname }} />;
  }
  if (anyOf.length > 0 && !hasAnyPermission(permissions, anyOf)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
