import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import LoadStatus from '../components/LoadStatus';
import OrderDetails, { formatOrderDate } from '../components/OrderDetails';
import { usePermissions } from '../auth/PermissionsContext';
import { payerTypeFor, paymentService } from '../services/paymentService';
import { useAsync } from '../hooks/useAsync';

export default function MyOrdersPage() {
  const { user } = useAuth0();
  const { permissions } = usePermissions();
  const payerType = payerTypeFor(permissions);
  const buyerId = user?.sub ?? '';
  const { data: orders, isLoading, error } = useAsync(
    () => paymentService.listMyOrders(payerType, buyerId),
    [payerType, buyerId],
  );

  return (
    <Container as="section" className="py-4">
      <h1>Mis compras</h1>
      <LoadStatus isLoading={isLoading} error={error} />
      {orders?.length === 0 && (
        <Alert variant="info">
          Todavía no tienes compras. <Link to="/productos">Ver productos</Link>
        </Alert>
      )}
      {orders?.map((order) => (
        <Card key={order.orderNumber} className="mb-3">
          <Card.Header className="d-flex justify-content-between flex-wrap gap-2">
            <span className="fw-semibold">Pedido {order.orderNumber}</span>
            <span className="text-muted">{formatOrderDate(order.createdAt)}</span>
          </Card.Header>
          <Card.Body>
            <OrderDetails order={order} />
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
