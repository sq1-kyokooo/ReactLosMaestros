import { fireEvent, screen, waitFor } from '@testing-library/react';
import CheckoutPage from './CheckoutPage';
import { CART_STORAGE_KEY } from '../cart/CartContext';
import { MOCK_KEYS } from '../services/mockStorage';
import { Permission } from '../auth/permissions';
import { loggedInAs, loggedOut, makeProduct, renderWithProviders } from '../testUtils';
import type { CartItem, Product } from '../types';

const hammer = makeProduct({ code: 'P001', price: 10000, stock: 5 });
const putInCart = (items: CartItem[]) => localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
const storedProducts = (): Product[] => JSON.parse(localStorage.getItem(MOCK_KEYS.products)!);
const typeInto = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('CheckoutPage', () => {
  beforeEach(() => localStorage.setItem(MOCK_KEYS.products, JSON.stringify([hammer])));
  afterEach(() => localStorage.clear());

  it('asks guests to log in and keeps their cart', () => {
    putInCart([{ product: hammer, quantity: 1 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedOut });

    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('explains when the account has no purchase permission yet', async () => {
    putInCart([{ product: hammer, quantity: 1 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([]) });

    expect(await screen.findByText(/Tu cuenta todavía no tiene permiso para comprar/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Pagar/ })).toBeNull();
  });

  it('lets contractors pay', async () => {
    putInCart([{ product: hammer, quantity: 1 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([Permission.writeContractorPayments]) });

    expect(await screen.findByText('Compra como contratista.')).toBeTruthy();
  });

  it('tells the user when the cart is empty', async () => {
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([Permission.writePayments]) });

    expect(await screen.findByText('Tu carrito está vacío.')).toBeTruthy();
  });

  it('prefills the logged-in user and validates the shipping address', async () => {
    putInCart([{ product: hammer, quantity: 1 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([Permission.writePayments]) });

    expect(((await screen.findByLabelText('Correo electrónico')) as HTMLInputElement).value).toBe('test@correo.cl');
    fireEvent.click(screen.getByRole('button', { name: /^Pagar/ }));

    expect(await screen.findByText('Ingresa una dirección.')).toBeTruthy();
  });

  it('pays, shows the order inline, empties the cart and discounts stock', async () => {
    putInCart([{ product: hammer, quantity: 2 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([Permission.writePayments]) });
    await screen.findByLabelText('Dirección');
    typeInto('Dirección', 'Calle 123');
    typeInto('Comuna', 'Pudahuel');

    fireEvent.click(screen.getByRole('button', { name: /^Pagar/ }));

    expect(await screen.findByRole('heading', { name: '¡Compra exitosa!' })).toBeTruthy();
    await waitFor(() => {
      if (localStorage.getItem(CART_STORAGE_KEY) !== '[]') throw new Error('cart not cleared yet');
    });
    expect(storedProducts()[0].stock).toBe(3);
    expect(screen.getByRole('link', { name: 'Ver mis compras' }).getAttribute('href')).toBe('/mis-compras');
    expect(JSON.parse(localStorage.getItem(MOCK_KEYS.orders)!)[0].buyerId).toBe('auth0|test');
  });

  it('shows the payment error inline and keeps the cart', async () => {
    putInCart([{ product: { ...hammer, stock: 99 }, quantity: 9 }]);
    renderWithProviders(<CheckoutPage />, { auth: loggedInAs([Permission.writePayments]) });
    fireEvent.change(await screen.findByLabelText('Tipo de entrega'), { target: { value: 'pickup' } });

    fireEvent.click(screen.getByRole('button', { name: /^Pagar/ }));

    expect(await screen.findByText(/No hay stock suficiente de Martillo/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).length).toBe(1);
  });
});
