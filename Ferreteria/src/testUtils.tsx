import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Auth0Context, initialContext, type Auth0ContextInterface } from '@auth0/auth0-react';
import { PermissionsProvider } from './auth/PermissionsContext';
import { CartProvider } from './cart/CartContext';
import type { Product } from './types';

const toBase64Url = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '');

export function fakeAccessToken(permissions: string[]): string {
  return `${toBase64Url({ alg: 'none' })}.${toBase64Url({ permissions })}.signature`;
}

export function loggedInAs(permissions: string[], user = { sub: 'auth0|test', name: 'Test User', email: 'test@correo.cl' }): Partial<Auth0ContextInterface> {
  return {
    isLoading: false,
    isAuthenticated: true,
    user,
    getAccessTokenSilently: (() => Promise.resolve(fakeAccessToken(permissions))) as Auth0ContextInterface['getAccessTokenSilently'],
  };
}

export const loggedOut: Partial<Auth0ContextInterface> = { isLoading: false, isAuthenticated: false };

interface RenderOptions {
  auth?: Partial<Auth0ContextInterface>;
  route?: string;
  path?: string;
  extraRoutes?: { path: string; element: ReactElement }[];
}

export function renderWithProviders(ui: ReactElement, { auth = loggedOut, route = '/', path, extraRoutes = [] }: RenderOptions = {}) {
  const auth0Value = { ...initialContext, ...auth } as Auth0ContextInterface;
  return render(
    <Auth0Context.Provider value={auth0Value}>
      <PermissionsProvider>
        <CartProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path ?? route.split('?')[0]} element={ui} />
              {extraRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </PermissionsProvider>
    </Auth0Context.Provider>,
  );
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    code: 'P001',
    name: 'Martillo',
    category: 'Herramientas',
    brand: 'Acme',
    price: 5000,
    stock: 10,
    ...overrides,
  };
}
