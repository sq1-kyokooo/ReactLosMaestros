import type { CartItem, DeliveryMethod, Product } from '../types';

export const FREE_SHIPPING_FROM = 50000;
export const SHIPPING_COST = 5000;

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

export function formatCLP(amount: number): string {
  return clpFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function isOnOffer(product: Product): boolean {
  return (product.discountPercent ?? 0) > 0;
}

export function finalPrice(product: Product): number {
  const discount = isOnOffer(product) ? product.discountPercent! : 0;
  return Math.round(product.price * (1 - discount / 100));
}

export function lineTotal(item: CartItem): number {
  return finalPrice(item.product) * item.quantity;
}

export function summarizeCart(items: CartItem[], delivery: DeliveryMethod = 'shipping') {
  const units = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const shippingIsFree = delivery === 'pickup' || units === 0 || subtotal > FREE_SHIPPING_FROM;
  const shippingCost = shippingIsFree ? 0 : SHIPPING_COST;
  return { units, subtotal, shippingCost, total: subtotal + shippingCost };
}
