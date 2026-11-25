import { screen } from '@testing-library/react';
import MyOrdersPage from './MyOrdersPage';
import { MOCK_KEYS } from '../services/mockStorage';
import { Permission } from '../auth/permissions';
import { loggedInAs, renderWithProviders } from '../testUtils';
import type { Order } from '../types';

const order = (orderNumber: string, buyerId: string, createdAt: string) => ({
  orderNumber,
  createdAt,
  buyerId,
  items: [{ code: 'MC001', name: 'Cemento', quantity: 2, lineTotal: 11980 }],
  deliveryAddress: 'Retiro en tienda',
  shippingCost: 0,
  total: 11980,
  email: 'test@correo.cl',
});

const storeOrders = (orders: (Order & { buyerId: string })[]) =>
  localStorage.setItem(MOCK_KEYS.orders, JSON.stringify(orders));

describe('MyOrdersPage', () => {
  afterEach(() => localStorage.clear());

  it('shows only the logged-in buyer\'s orders, newest first', async () => {
    storeOrders([
      order('FM-OLD', 'auth0|test', '2026-01-10T12:00:00.000Z'),
      order('FM-OTHER', 'auth0|someone-else', '2026-02-10T12:00:00.000Z'),
      order('FM-NEW', 'auth0|test', '2026-03-10T12:00:00.000Z'),
    ]);
    renderWithProviders(<MyOrdersPage />, { auth: loggedInAs([Permission.writePayments]) });

    const headers = await screen.findAllByText(/^Pedido FM-/);

    expect(headers.map((h) => h.textContent)).toEqual(['Pedido FM-NEW', 'Pedido FM-OLD']);
    expect(screen.getAllByText(/2 × Cemento/).length).toBe(2);
  });

  it('shows an empty state when there are no purchases', async () => {
    renderWithProviders(<MyOrdersPage />, { auth: loggedInAs([Permission.writeContractorPayments]) });

    expect(await screen.findByText(/Todavía no tienes compras/)).toBeTruthy();
  });
});
