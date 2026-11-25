import { cartReducer, type CartState } from './CartContext';
import { makeProduct } from '../testUtils';

const hammer = makeProduct({ code: 'P001', stock: 3 });
const saw = makeProduct({ code: 'P002', name: 'Serrucho', stock: 5 });
const emptyCart: CartState = { items: [], notice: null };

describe('cartReducer', () => {
  it('adds a new product with a success notice', () => {
    const state = cartReducer(emptyCart, { type: 'add', product: hammer, quantity: 2 });

    expect(state.items).toEqual([{ product: hammer, quantity: 2 }]);
    expect(state.notice).toEqual({ text: 'Martillo agregado al carrito.', variant: 'success' });
  });

  it('sums quantities when the product is already in the cart', () => {
    const state = cartReducer({ ...emptyCart, items: [{ product: hammer, quantity: 1 }] }, { type: 'add', product: hammer, quantity: 2 });

    expect(state.items).toEqual([{ product: hammer, quantity: 3 }]);
  });

  it('refuses to go over the available stock', () => {
    const start = { ...emptyCart, items: [{ product: hammer, quantity: 3 }] };

    const state = cartReducer(start, { type: 'add', product: hammer, quantity: 1 });

    expect(state.items).toEqual(start.items);
    expect(state.notice?.variant).toBe('warning');
  });

  it('sets a valid quantity and ignores out-of-range ones', () => {
    const start = { ...emptyCart, items: [{ product: saw, quantity: 1 }] };

    expect(cartReducer(start, { type: 'setQuantity', code: 'P002', quantity: 4 }).items[0].quantity).toBe(4);
    expect(cartReducer(start, { type: 'setQuantity', code: 'P002', quantity: 6 })).toBe(start);
    expect(cartReducer(start, { type: 'setQuantity', code: 'P002', quantity: 0 })).toBe(start);
  });

  it('removes a product and clears the whole cart', () => {
    const start = { ...emptyCart, items: [{ product: hammer, quantity: 1 }, { product: saw, quantity: 1 }] };

    expect(cartReducer(start, { type: 'remove', code: 'P001' }).items).toEqual([{ product: saw, quantity: 1 }]);
    expect(cartReducer(start, { type: 'clear' })).toEqual(emptyCart);
  });
});
