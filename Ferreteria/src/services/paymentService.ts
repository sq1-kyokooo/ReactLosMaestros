import { apiRequest } from '../api/httpClient';
import { endpoints } from '../api/endpoints';
import { USE_MOCK_API } from '../config';
import { seedProducts } from '../data/seedProducts';
import { Permission } from '../auth/permissions';
import type { CartItem, CheckoutForm, OperationResult, Order } from '../types';
import { lineTotal, summarizeCart } from '../utils/pricing';
import { MOCK_KEYS, readMockList, writeMockList } from './mockStorage';
import { failure, runApiOperation, success } from './results';

export type PayerType = 'user' | 'contractor';

export function payerTypeFor(permissions: string[]): PayerType {
  return permissions.includes(Permission.writeContractorPayments) ? 'contractor' : 'user';
}

// `buyerId` is the Auth0 `sub`. Only the mock uses it; the backend reads the buyer from the token.
export interface PaymentRequest {
  payerType: PayerType;
  buyerId: string;
  items: CartItem[];
  customer: CheckoutForm;
}

export interface PaymentService {
  pay(request: PaymentRequest): Promise<OperationResult<Order>>;
  listMyOrders(payerType: PayerType, buyerId: string): Promise<Order[]>;
}

function deliveryAddressOf(customer: CheckoutForm) {
  return customer.delivery === 'pickup' ? 'Retiro en tienda' : `${customer.address}, ${customer.commune}`;
}

export function buildOrder({ items, customer }: Pick<PaymentRequest, 'items' | 'customer'>, orderNumber: string, createdAt: Date): Order {
  const { shippingCost, total } = summarizeCart(items, customer.delivery);
  return {
    orderNumber,
    createdAt: createdAt.toISOString(),
    items: items.map((item) => ({
      code: item.product.code,
      name: item.product.name,
      quantity: item.quantity,
      lineTotal: lineTotal(item),
    })),
    deliveryAddress: deliveryAddressOf(customer),
    shippingCost,
    total,
    email: customer.email,
  };
}

const newestFirst = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt);

type StoredOrder = Order & { buyerId: string };

const EMPTY_CART = 'Tu carrito está vacío.';

export const mockPaymentService: PaymentService = {
  async pay(request) {
    if (request.items.length === 0) return failure(EMPTY_CART);
    try {
      const products = readMockList(MOCK_KEYS.products, seedProducts);
      for (const item of request.items) {
        const product = products.find((p) => p.code === item.product.code);
        if (!product || product.stock < item.quantity) {
          return failure(`No hay stock suficiente de ${item.product.name}.`);
        }
        product.stock -= item.quantity;
      }
      const now = new Date();
      const order = buildOrder(request, `FM-${now.getTime().toString().slice(-8)}`, now);
      const orders = readMockList<StoredOrder>(MOCK_KEYS.orders, []);
      writeMockList(MOCK_KEYS.products, products);
      writeMockList(MOCK_KEYS.orders, [...orders, { ...order, buyerId: request.buyerId }]);
      return success('Pago aprobado.', order);
    } catch {
      return failure('No se pudo procesar el pago.');
    }
  },

  async listMyOrders(_payerType, buyerId) {
    return readMockList<StoredOrder>(MOCK_KEYS.orders, [])
      .filter((order) => order.buyerId === buyerId)
      .map(({ buyerId: _owner, ...order }) => order)
      .sort(newestFirst);
  },
};

// The backend recalculates prices and stock; we only send codes and quantities.
export const apiPaymentService: PaymentService = {
  async pay({ payerType, items, customer }) {
    if (items.length === 0) return failure(EMPTY_CART);
    const endpoint = payerType === 'contractor' ? endpoints.payments.contractorCheckout : endpoints.payments.userCheckout;
    return runApiOperation(
      () =>
        apiRequest<Order>(endpoint, {
          method: 'POST',
          authenticated: true,
          body: {
            items: items.map((item) => ({ code: item.product.code, quantity: item.quantity })),
            customer,
          },
        }),
      'Pago aprobado.',
    );
  },

  async listMyOrders(payerType) {
    const endpoint = payerType === 'contractor' ? endpoints.payments.contractorOrders : endpoints.payments.userOrders;
    const orders = await apiRequest<Order[]>(endpoint, { authenticated: true });
    return [...orders].sort(newestFirst);
  },
};

export const paymentService = USE_MOCK_API ? mockPaymentService : apiPaymentService;
