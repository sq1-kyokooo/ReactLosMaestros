import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Spinner from 'react-bootstrap/Spinner';
import { usePermissions } from '../auth/PermissionsContext';
import { ADMIN_PERMISSIONS, hasAnyPermission, Permission } from '../auth/permissions';

const PERMISSION_LABELS: Record<string, string> = {
  [Permission.manageProducts]: 'Administrar productos',
  [Permission.manageUsers]: 'Administrar usuarios',
  [Permission.writePayments]: 'Realizar compras',
  [Permission.writeContractorPayments]: 'Compras de contratista',
  [Permission.readSells]: 'Ver ventas',
  [Permission.readProfile]: 'Ver perfil',
  [Permission.readContractor]: 'Panel de contratista',
};

export interface LoginRedirectState {
  returnTo?: string;
}

export default function LoginPage() {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect, logout } = useAuth0();
  const { permissions } = usePermissions();
  const returnTo = (useLocation().state as LoginRedirectState | null)?.returnTo ?? '/';

  const login = () => loginWithRedirect({ appState: { returnTo } });
  const signup = () => loginWithRedirect({ appState: { returnTo }, authorizationParams: { screen_hint: 'signup' } });
  const logoutToHome = () => logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" aria-label="Cargando" />
      </Container>
    );
  }

  return (
    <Container as="section" className="py-5 login-container">
      <Card>
        <Card.Body>
          {isAuthenticated && user ? (
            <>
              <Card.Title as="h1" className="h3">
                Hola, {user.name ?? user.email}
              </Card.Title>
              <p className="text-muted">{user.email}</p>
              {permissions.length > 0 && (
                <>
                  <h2 className="h6">Tus permisos</h2>
                  <ul>
                    {permissions.map((p) => (
                      <li key={p}>{PERMISSION_LABELS[p] ?? p}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="d-flex gap-2">
                {hasAnyPermission(permissions, ADMIN_PERMISSIONS) && (
                  <Link to="/admin" className="btn btn-primary">
                    Ir al panel admin
                  </Link>
                )}
                <Button variant="outline-danger" onClick={logoutToHome}>
                  Cerrar sesión
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card.Title as="h1" className="h3">
                Ingresar
              </Card.Title>
              <p>Inicia sesión para comprar y revisar tus pedidos.</p>
              {error && <Alert variant="danger">{error.message}</Alert>}
              <div className="d-flex gap-2">
                <Button onClick={login}>Iniciar sesión</Button>
                <Button variant="outline-primary" onClick={signup}>
                  Crear cuenta
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
