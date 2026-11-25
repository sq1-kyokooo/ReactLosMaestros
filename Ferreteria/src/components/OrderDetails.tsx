import type { Order } from '../types';
import { formatCLP } from '../utils/pricing';

const dateFormatter = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

export function formatOrderDate(isoDate: string): string {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export default function OrderDetails({ order }: { order: Order }) {
  return (
    <>
      <ul className="mb-2">
        {order.items.map((item) => (
          <li key={item.code}>
            {item.quantity} × {item.name} — {formatCLP(item.lineTotal)}
          </li>
        ))}
      </ul>
      <p className="mb-1">Entrega: {order.deliveryAddress}</p>
      <p className="mb-1">Envío: {formatCLP(order.shippingCost)}</p>
      <p className="fw-bold mb-0">Total pagado: {formatCLP(order.total)}</p>
    </>
  );
}
