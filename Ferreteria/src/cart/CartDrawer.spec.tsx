import { fireEvent, screen } from '@testing-library/react';
import CartDrawer from './CartDrawer';
import { useCart } from './CartContext';
import { makeProduct, renderWithProviders } from '../testUtils';

const hammer = makeProduct({ code: 'P001', price: 10000, stock: 3 });

function DrawerWithAddButton() {
  const { addItem, openCart } = useCart();
  return (
    <>
      <button onClick={() => addItem(hammer)}>add</button>
      <button onClick={openCart}>open</button>
      <CartDrawer />
    </>
  );
}

describe('CartDrawer', () => {
  afterEach(() => localStorage.clear());

  it('shows an empty cart', async () => {
    renderWithProviders(<DrawerWithAddButton />);
    fireEvent.click(screen.getByText('open'));

    expect(await screen.findByText('Tu carrito está vacío.')).toBeTruthy();
  });

  it('lists items with totals and lets the user change quantities', async () => {
    renderWithProviders(<DrawerWithAddButton />);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('open'));

    expect(await screen.findByText('Mi carrito (1)')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Agregar una unidad de Martillo'));

    expect(screen.getByText('Mi carrito (2)')).toBeTruthy();
    expect(screen.getByLabelText('Cantidad de Martillo').textContent).toBe('2');
  });

  it('empties the cart', async () => {
    renderWithProviders(<DrawerWithAddButton />);
    fireEvent.click(screen.getByText('add'));
    fireEvent.click(screen.getByText('open'));

    fireEvent.click(await screen.findByRole('button', { name: 'Vaciar carrito' }));

    expect(screen.getByText('Tu carrito está vacío.')).toBeTruthy();
  });
});
