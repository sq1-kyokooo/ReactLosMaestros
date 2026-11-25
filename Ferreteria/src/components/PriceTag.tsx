import type { Product } from '../types';
import { finalPrice, formatCLP, isOnOffer } from '../utils/pricing';

export default function PriceTag({ product }: { product: Product }) {
  if (!isOnOffer(product)) {
    return <span className="fw-bold">{formatCLP(product.price)}</span>;
  }
  return (
    <span className="fw-bold">
      <span className="text-danger me-2">{formatCLP(finalPrice(product))}</span>
      <span className="text-muted text-decoration-line-through small">{formatCLP(product.price)}</span>
    </span>
  );
}
