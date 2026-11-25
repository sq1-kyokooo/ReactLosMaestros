import { apiPaymentService, buildOrder, mockPaymentService, payerTypeFor, type PaymentRequest } from './paymentService';
import { MOCK_KEYS } from './mockStorage';
import { registerAccessTokenProvider } from '../api/httpClient';
import { API_BASE_URL } from '../config';
import { makeProduct } from '../testUtils';
import type { CheckoutForm, Product } from '../types';

const customer: CheckoutForm = {
  fullName: 'Pedro Pérez',
  email: 'pedro@correo.cl',
  delivery: 'shipping',
  address: 'Calle 123',
  commune: 'Pudahuel',
};

const hammer = makeProduct({ code: 'P001', price: 10000, stock: 5 });
const request = (quantity: number, overrides: Partial<PaymentRequest> = {}): PaymentRequest => ({
  payerType: 'user',
  buyerId: 'auth0|pedro',
  items: [{ product: hammer, quantity }],
  customer,
  ...overrides,
});

const storedProducts = (): Product[] => JSON.parse(localStorage.getItem(MOCK_KEYS.products)!);

describe('buildOrder', () => {
  it('adds shipping under the free-shipping threshold', () => {
    const order = buildOrder(request(2), 'FM-1', new Date('2026-11-25T10:00:00Z'));

    expect(order.items).toEqual([{ code: 'P001', name: 'Martillo', quantity: 2, lineTotal: 20000 }]);
    expect(order.shippingCost).toBe(5000);
    expect(order.total).toBe(25000);
    expect(order.deliveryAddress).toBe('Calle 123, Pudahuel');
    expect(order.createdAt).toBe('2026-11-25T10:00:00.000Z');
  });

  it('is free for store pickup', () => {
    const order = buildOrder(request(1, { customer: { ...customer, delivery: 'pickup' } }), 'FM-1', new Date());

    expect(order.shippingCost).toBe(0);
    expect(order.deliveryAddress).toBe('Retiro en tienda');
  });
});

describe('payerTypeFor', () => {
  it('treats users with contractor payments as contractors', () => {
    expect(payerTypeFor(['write:payments'])).toBe('user');
    expect(payerTypeFor(['write:contractor_payments'])).toBe('contractor');
  });
});

describe('mockPaymentService', () => {
  beforeEach(() => localStorage.setItem(MOCK_KEYS.products, JSON.stringify([hammer])));
  afterEach(() => localStorage.clear());

  it('approves the payment and discounts stock', async () => {
    const result = await mockPaymentService.pay(request(2));

    expect(result.ok).toBeTrue();
    expect(result.data?.orderNumber).toMatch(/^FM-\d+$/);
    expect(storedProducts()[0].stock).toBe(3);
  });

  it('rejects when there is not enough stock and keeps stock intact', async () => {
    const result = await mockPaymentService.pay(request(6));

    expect(result).toEqual(jasmine.objectContaining({ ok: false, message: 'No hay stock suficiente de Martillo.' }));
    expect(storedProducts()[0].stock).toBe(5);
  });

  it('rejects an empty cart', async () => {
    expect((await mockPaymentService.pay(request(1, { items: [] }))).ok).toBeFalse();
  });

  it('lists only the buyer\'s own orders, newest first', async () => {
    const first = (await mockPaymentService.pay(request(1))).data!;
    await mockPaymentService.pay(request(1, { buyerId: 'auth0|someone-else' }));
    const stored = JSON.parse(localStorage.getItem(MOCK_KEYS.orders)!);
    stored.push({ ...first, orderNumber: 'FM-NEWER', createdAt: '2099-01-01T00:00:00.000Z', buyerId: 'auth0|pedro' });
    localStorage.setItem(MOCK_KEYS.orders, JSON.stringify(stored));

    const orders = await mockPaymentService.listMyOrders('user', 'auth0|pedro');

    expect(orders.map((o) => o.orderNumber)).toEqual(['FM-NEWER', first.orderNumber]);
    expect(Object.keys(orders[0])).not.toContain('buyerId');
  });

  it('does not save an order when the payment fails', async () => {
    await mockPaymentService.pay(request(99));

    expect(await mockPaymentService.listMyOrders('user', 'auth0|pedro')).toEqual([]);
  });
});

describe('apiPaymentService', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    registerAccessTokenProvider(() => Promise.resolve('token-123'));
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(
      new Response(JSON.stringify(buildOrder(request(1), 'FM-API', new Date())), { status: 200 }),
    );
  });
  afterEach(() => registerAccessTokenProvider(null));

  it('sends only codes and quantities to the user payment endpoint', async () => {
    const result = await apiPaymentService.pay(request(2));

    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${API_BASE_URL}/payments/user/checkout`);
    expect(JSON.parse(init.body).items).toEqual([{ code: 'P001', quantity: 2 }]);
    expect(result.data?.orderNumber).toBe('FM-API');
  });

  it('uses the contractor endpoint for contractors', async () => {
    await apiPaymentService.pay(request(1, { payerType: 'contractor' }));

    expect(fetchSpy.calls.mostRecent().args[0]).toBe(`${API_BASE_URL}/payments/contractor/checkout`);
  });

  it('loads the buyer\'s orders from the matching endpoint, newest first', async () => {
    const older = buildOrder(request(1), 'FM-OLD', new Date('2026-01-01'));
    const newer = buildOrder(request(1), 'FM-NEW', new Date('2026-06-01'));
    fetchSpy.and.callFake(() => Promise.resolve(new Response(JSON.stringify([older, newer]), { status: 200 })));

    const orders = await apiPaymentService.listMyOrders('user', 'ignored');
    await apiPaymentService.listMyOrders('contractor', 'ignored');

    const [userUrl, userInit] = fetchSpy.calls.argsFor(0);
    expect(userUrl).toBe(`${API_BASE_URL}/payments/user/orders`);
    expect(userInit.headers.Authorization).toBe('Bearer token-123');
    expect(fetchSpy.calls.argsFor(1)[0]).toBe(`${API_BASE_URL}/payments/contractor/orders`);
    expect(orders.map((o) => o.orderNumber)).toEqual(['FM-NEW', 'FM-OLD']);
  });

  it('reports a server error message', async () => {
    fetchSpy.and.resolveTo(new Response(JSON.stringify({ message: 'Tarjeta rechazada' }), { status: 402 }));

    expect((await apiPaymentService.pay(request(1))).message).toBe('Tarjeta rechazada');
  });
});
