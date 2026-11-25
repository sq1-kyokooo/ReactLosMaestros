import { finalPrice, formatCLP, isOnOffer, summarizeCart } from './pricing';
import { makeProduct } from '../testUtils';

describe('pricing', () => {
  it('formats Chilean pesos without decimals', () => {
    expect(formatCLP(5990).replace(/\s/g, '')).toBe('$5.990');
    expect(formatCLP(NaN).replace(/\s/g, '')).toBe('$0');
  });

  it('applies the discount only when the product is on offer', () => {
    expect(isOnOffer(makeProduct())).toBeFalse();
    expect(finalPrice(makeProduct({ price: 5990 }))).toBe(5990);
    expect(isOnOffer(makeProduct({ discountPercent: 15 }))).toBeTrue();
    expect(finalPrice(makeProduct({ price: 5990, discountPercent: 15 }))).toBe(5092);
  });

  describe('summarizeCart', () => {
    it('charges shipping up to the free-shipping threshold', () => {
      const summary = summarizeCart([{ product: makeProduct({ price: 10000 }), quantity: 2 }]);

      expect(summary).toEqual({ units: 2, subtotal: 20000, shippingCost: 5000, total: 25000 });
    });

    it('ships for free above the threshold or on pickup', () => {
      const bigOrder = [{ product: makeProduct({ price: 60000 }), quantity: 1 }];
      const smallOrder = [{ product: makeProduct({ price: 1000 }), quantity: 1 }];

      expect(summarizeCart(bigOrder).shippingCost).toBe(0);
      expect(summarizeCart(smallOrder, 'pickup').shippingCost).toBe(0);
    });

    it('is all zeros for an empty cart', () => {
      expect(summarizeCart([])).toEqual({ units: 0, subtotal: 0, shippingCost: 0, total: 0 });
    });
  });
});
