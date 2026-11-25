import { fireEvent, screen } from '@testing-library/react';
import AdminPage from './AdminPage';
import { tabsAllowedFor } from './adminTabs';
import { Permission } from '../auth/permissions';
import { loggedInAs, renderWithProviders } from '../testUtils';

describe('tabsAllowedFor', () => {
  it('shows product tabs only for manage:products', () => {
    const labels = tabsAllowedFor([Permission.manageProducts]).map((t) => t.label);

    expect(labels).toEqual(['Listar productos', 'Agregar producto', 'Editar precio', 'Eliminar producto']);
  });

  it('shows employee tabs only for manage:users', () => {
    expect(tabsAllowedFor([Permission.manageUsers]).every((t) => t.label.includes('empleado'))).toBeTrue();
  });

  it('shows nothing without admin permissions', () => {
    expect(tabsAllowedFor([Permission.writePayments])).toEqual([]);
  });
});

describe('AdminPage', () => {
  afterEach(() => localStorage.clear());

  it('opens the first allowed panel and switches panels from the sidebar', async () => {
    renderWithProviders(<AdminPage />, { auth: loggedInAs([Permission.manageProducts, Permission.manageUsers]) });

    expect(await screen.findByRole('heading', { name: 'Inventario de productos' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Listar empleados' }));

    expect(await screen.findByRole('heading', { name: 'Lista de empleados' })).toBeTruthy();
  });

  it('hides the employee tabs from a products-only admin', async () => {
    renderWithProviders(<AdminPage />, { auth: loggedInAs([Permission.manageProducts]) });

    await screen.findByRole('button', { name: 'Agregar producto' });
    expect(screen.queryByRole('button', { name: 'Agregar empleado' })).toBeNull();
  });
});
