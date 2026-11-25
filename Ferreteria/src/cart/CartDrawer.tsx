import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useCart } from './CartContext';
import { formatCLP, FREE_SHIPPING_FROM, lineTotal, summarizeCart } from '../utils/pricing';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const { units, subtotal, shippingCost, total } = summarizeCart(items);

  const goToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <Offcanvas show={isOpen} onHide={closeCart} placement="end" aria-labelledby="cart-title">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="cart-title">Mi carrito ({units})</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {items.length === 0 ? (
          <p className="text-muted">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="list-unstyled flex-grow-1">
              {items.map((item) => (
                <li key={item.product.code} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                  <ProductImage product={item.product} className="cart-item-image rounded" />
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-semibold">{item.product.name}</p>
                    <QuantityStepper
                      quantity={item.quantity}
                      max={item.product.stock}
                      label={item.product.name}
                      onChange={(quantity) => setQuantity(item.product.code, quantity)}
                    />
                  </div>
                  <div className="text-end">
                    <p className="mb-1 fw-bold">{formatCLP(lineTotal(item))}</p>
                    <Button size="sm" variant="link" className="text-danger p-0" onClick={() => removeItem(item.product.code)}>
                      Quitar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <p className="d-flex justify-content-between mb-1">
                <span>Subtotal</span> <span>{formatCLP(subtotal)}</span>
              </p>
              <p className="d-flex justify-content-between mb-1">
                <span>Envío estimado</span> <span>{formatCLP(shippingCost)}</span>
              </p>
              {shippingCost > 0 && (
                <p className="small text-muted mb-1">Envío gratis sobre {formatCLP(FREE_SHIPPING_FROM)}.</p>
              )}
              <p className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span> <span>{formatCLP(total)}</span>
              </p>
              <Button className="w-100 mb-2" onClick={goToCheckout}>
                Ir al pago
              </Button>
              <Button variant="outline-danger" className="w-100" onClick={clearCart}>
                Vaciar carrito
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
