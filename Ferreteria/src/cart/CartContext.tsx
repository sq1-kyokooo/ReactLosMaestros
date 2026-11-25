import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';

export const CART_STORAGE_KEY = 'cart';

export interface Notice {
  text: string;
  variant: 'success' | 'warning' | 'info';
}

export interface CartState {
  items: CartItem[];
  notice: Notice | null;
}

export type CartAction =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'setQuantity'; code: string; quantity: number }
  | { type: 'remove'; code: string }
  | { type: 'clear' }
  | { type: 'dismissNotice' };

const withNotice = (state: CartState, text: string, variant: Notice['variant'] = 'success'): CartState => ({
  ...state,
  notice: { text, variant },
});

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const { product, quantity } = action;
      const existing = state.items.find((item) => item.product.code === product.code);
      const newQuantity = (existing?.quantity ?? 0) + quantity;
      if (!Number.isInteger(quantity) || quantity < 1 || newQuantity > product.stock) {
        return withNotice(state, 'No hay stock suficiente para agregar ese producto.', 'warning');
      }
      const items = existing
        ? state.items.map((item) => (item.product.code === product.code ? { product, quantity: newQuantity } : item))
        : [...state.items, { product, quantity }];
      return withNotice({ ...state, items }, `${product.name} agregado al carrito.`);
    }
    case 'setQuantity': {
      const item = state.items.find((i) => i.product.code === action.code);
      if (!item || !Number.isInteger(action.quantity) || action.quantity < 1 || action.quantity > item.product.stock) {
        return state;
      }
      return {
        ...state,
        items: state.items.map((i) => (i.product.code === action.code ? { ...i, quantity: action.quantity } : i)),
      };
    }
    case 'remove':
      return withNotice(
        { ...state, items: state.items.filter((i) => i.product.code !== action.code) },
        'Producto eliminado del carrito.',
        'info',
      );
    case 'clear':
      return { items: [], notice: null };
    case 'dismissNotice':
      return { ...state, notice: null };
  }
}

function loadSavedItems(): CartItem[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
    return Array.isArray(saved) ? saved.filter((item) => item?.product?.code && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  notice: Notice | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (code: string, quantity: number) => void;
  removeItem: (code: string) => void;
  clearCart: () => void;
  dismissNotice: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, () => ({ items: loadSavedItems(), notice: null }));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // storage full or blocked: the cart still works for this session
    }
  }, [state.items]);

  const value: CartContextValue = {
    items: state.items,
    notice: state.notice,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem: (product, quantity = 1) => dispatch({ type: 'add', product, quantity }),
    setQuantity: (code, quantity) => dispatch({ type: 'setQuantity', code, quantity }),
    removeItem: (code) => dispatch({ type: 'remove', code }),
    clearCart: () => dispatch({ type: 'clear' }),
    dismissNotice: () => dispatch({ type: 'dismissNotice' }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>.');
  return context;
}
