import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useCart } from '../cart/CartContext';
import { catalogService } from '../services/catalogService';
import { useAsync } from '../hooks/useAsync';
import { isOnOffer } from '../utils/pricing';
import LoadStatus from '../components/LoadStatus';
import PriceTag from '../components/PriceTag';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';

export default function ProductDetailPage() {
  const { code = '' } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading, error } = useAsync(() => catalogService.findProduct(code), [code]);

  if (isLoading || error) {
    return (
      <Container className="py-5">
        <LoadStatus isLoading={isLoading} error={error} />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <h1 className="h2">Producto no encontrado</h1>
        <Link to="/productos" className="btn btn-primary mt-3">
          Volver al catálogo
        </Link>
      </Container>
    );
  }

  const isSoldOut = product.stock <= 0;

  return (
    <Container as="section" className="py-4">
      <Link to="/productos" className="btn btn-outline-secondary mb-3">
        &larr; Volver al catálogo
      </Link>
      <Row className="g-4">
        <Col md={6} className="text-center">
          <ProductImage product={product} className="img-fluid rounded product-detail-image" />
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 mb-2">
            <Badge bg="secondary">{product.category}</Badge>
            {isOnOffer(product) && <Badge bg="danger">En oferta</Badge>}
          </div>
          <h1 className="h2 mb-3">{product.name}</h1>
          <p className="fs-3">
            <PriceTag product={product} />
          </p>
          {product.description && <p className="text-muted">{product.description}</p>}
          <p className="small text-muted">
            Marca: {product.brand} · Stock disponible: {product.stock}
          </p>
          <div className="d-flex align-items-center gap-3">
            {!isSoldOut && (
              <QuantityStepper quantity={quantity} max={product.stock} label={product.name} onChange={setQuantity} />
            )}
            <Button size="lg" disabled={isSoldOut} onClick={() => addItem(product, quantity)}>
              {isSoldOut ? 'Agotado' : 'Agregar al carrito'}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
