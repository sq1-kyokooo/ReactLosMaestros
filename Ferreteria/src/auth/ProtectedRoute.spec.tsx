import { screen } from '@testing-library/react';
import type { Auth0ContextInterface } from '@auth0/auth0-react';
import ProtectedRoute from './ProtectedRoute';
import { Permission, permissionsFromToken } from './permissions';
import { fakeAccessToken, loggedInAs, loggedOut, renderWithProviders } from '../testUtils';

describe('permissionsFromToken', () => {
  it('reads the permissions claim', () => {
    expect(permissionsFromToken(fakeAccessToken(['manage:products']))).toEqual(['manage:products']);
  });

  it('returns no permissions for a missing or malformed token', () => {
    expect(permissionsFromToken(undefined)).toEqual([]);
    expect(permissionsFromToken('not-a-jwt')).toEqual([]);
  });
});

describe('ProtectedRoute', () => {
  const renderAdminRoute = (auth: Partial<Auth0ContextInterface>) =>
    renderWithProviders(
      <ProtectedRoute anyOf={[Permission.manageProducts, Permission.manageUsers]}>
        <p>Panel admin</p>
      </ProtectedRoute>,
      {
        auth,
        route: '/admin',
        extraRoutes: [
          { path: '/', element: <p>Inicio</p> },
          { path: '/login', element: <p>Pagina login</p> },
        ],
      },
    );

  it('shows a loading message while Auth0 starts', () => {
    renderAdminRoute({ isLoading: true, isAuthenticated: false });

    expect(screen.getByText('Cargando...')).toBeTruthy();
  });

  it('redirects to /login when nobody is logged in', () => {
    renderAdminRoute(loggedOut);

    expect(screen.getByText('Pagina login')).toBeTruthy();
  });

  it('redirects home when the token lacks admin permissions', async () => {
    renderAdminRoute(loggedInAs([Permission.writePayments]));

    expect(await screen.findByText('Inicio')).toBeTruthy();
  });

  it('renders the content with any of the required permissions', async () => {
    renderAdminRoute(loggedInAs([Permission.manageUsers]));

    expect(await screen.findByText('Panel admin')).toBeTruthy();
  });
});
