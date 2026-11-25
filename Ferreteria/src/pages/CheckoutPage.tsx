import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useCart } from '../cart/CartContext';
import { usePermissions } from '../auth/PermissionsContext';
import { hasAnyPermission, PURCHASE_PERMISSIONS } from '../auth/permissions';
import { payerTypeFor, paymentService } from '../services/paymentService';
import OrderDetails from '../components/OrderDetails';
import { formatCLP, lineTotal, summarizeCart } from '../utils/pricing';
import { hasErrors, validateCheckout } from '../utils/validation';
import type { CheckoutForm, FieldErrors, Order } from '../types';

export default function CheckoutPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const { permissions, isLoading: arePermissionsLoading } = usePermissions();
  const { items } = useCart();
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  let content;
  if (confirmedOrder) content = <OrderConfirmation order={confirmedOrder} />;
  else if (isLoading) content = null;
  else if (!isAuthenticated) content = <LoginRequired />;
  else if (items.length === 0) content = <EmptyCart />;
  else if (arePermissionsLoading) content = <PreparingAccount />;
  else if (!hasAnyPermission(permissions, PURCHASE_PERMISSIONS)) content = <PurchaseNotAllowed />;
  else content = <PaymentForm onPaid={setConfirmedOrder} />;

  return (
    <Container as="section" className="py-4">
      {content}
    </Container>
  );
}

function PaymentForm({ onPaid }: { onPaid: (order: Order) => void }) {
  const { user } = useAuth0();
  const { permissions } = usePermissions();
  const { items, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    delivery: 'shipping',
    address: '',
    commune: '',
  });
  const [errors, setErrors] = useState<FieldErrors<CheckoutForm>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const { subtotal, shippingCost, total } = summarizeCart(items, form.delivery);
  const payerType = payerTypeFor(permissions);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const pay = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateCheckout(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsPaying(true);
    setPaymentError(null);
    const result = await paymentService.pay({ payerType, buyerId: user?.sub ?? '', items, customer: form });
    setIsPaying(false);

    if (result.ok && result.data) {
      onPaid(result.data);
      clearCart();
    } else {
      setPaymentError(result.message);
    }
  };

  const textField = (name: 'fullName' | 'email' | 'address' | 'commune', label: string, type = 'text') => (
    <Form.Group controlId={`checkout-${name}`} className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control type={type} name={name} value={form[name]} onChange={updateField} isInvalid={Boolean(errors[name])} />
      <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <>
      <h1>Finalizar compra</h1>
      {paymentError && (
        <Alert variant="danger">No se pudo realizar el pago: {paymentError} Tu carrito sigue guardado.</Alert>
      )}
      <Row className="g-4">
        <Col lg={7}>
          <Form onSubmit={pay} noValidate>
            {textField('fullName', 'Nombre completo')}
            {textField('email', 'Correo electrónico', 'email')}
            <Form.Group controlId="checkout-delivery" className="mb-3">
              <Form.Label>Tipo de entrega</Form.Label>
              <Form.Select name="delivery" value={form.delivery} onChange={updateField}>
                <option value="shipping">Despacho a domicilio</option>
                <option value="pickup">Retiro en tienda (sin costo)</option>
              </Form.Select>
            </Form.Group>
            {form.delivery === 'shipping' && (
              <>
                {textField('address', 'Dirección')}
                {textField('commune', 'Comuna')}
              </>
            )}
            <Button type="submit" disabled={isPaying}>
              {isPaying ? 'Procesando...' : `Pagar ${formatCLP(total)}`}
            </Button>
          </Form>
        </Col>
        <Col lg={5}>
          <Card>
            <Card.Body>
              <h2 className="h5">Resumen</h2>
              {items.map((item) => (
                <p className="mb-1" key={item.product.code}>
                  {item.quantity} × {item.product.name}: {formatCLP(lineTotal(item))}
                </p>
              ))}
              <hr />
              <p className="mb-1">Subtotal: {formatCLP(subtotal)}</p>
              <p className="mb-1">Envío: {formatCLP(shippingCost)}</p>
              <p className="fw-bold">Total: {formatCLP(total)}</p>
              {payerType === 'contractor' && <p className="small text-muted mb-0">Compra como contratista.</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

function OrderConfirmation({ order }: { order: Order }) {
  return (
    <>
      <h1>¡Compra exitosa!</h1>
      <Alert variant="success">
        Pedido {order.orderNumber}. Enviamos el comprobante a {order.email}.
      </Alert>
      <OrderDetails order={order} />
      <div className="d-flex gap-2 mt-3">
        <Link to="/productos" className="btn btn-primary">
          Seguir comprando
        </Link>
        <Link to="/mis-compras" className="btn btn-outline-primary">
          Ver mis compras
        </Link>
      </div>
    </>
  );
}

function PreparingAccount() {
  return (
    <div className="d-flex align-items-center gap-2">
      <Spinner animation="border" size="sm" role="status" aria-hidden />
      <span>Preparando tu cuenta...</span>
    </div>
  );
}

function PurchaseNotAllowed() {
  const { reloadPermissions } = usePermissions();
  return (
    <>
      <h1>Finalizar compra</h1>
      <Alert variant="warning">
        Tu cuenta todavía no tiene permiso para comprar. Si te acabas de registrar, vuelve a intentarlo en unos
        segundos o cierra sesión y vuelve a entrar. Tu carrito se mantiene guardado.
      </Alert>
      <Button onClick={reloadPermissions}>Volver a intentar</Button>
    </>
  );
}

function LoginRequired() {
  const { loginWithRedirect } = useAuth0();
  return (
    <>
      <h1>Finalizar compra</h1>
      <Alert variant="info">Debes iniciar sesión para pagar. Tu carrito se mantiene guardado.</Alert>
      <Button onClick={() => loginWithRedirect({ appState: { returnTo: '/checkout' } })}>Iniciar sesión</Button>
    </>
  );
}

function EmptyCart() {
  return (
    <>
      <h1>Finalizar compra</h1>
      <Alert variant="info">Tu carrito está vacío.</Alert>
      <Link to="/productos" className="btn btn-primary">
        Ver productos
      </Link>
    </>
  );
}
