import { Link } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import type { Product } from '../types';
import { useCart } from '../cart/CartContext';
import { isOnOffer } from '../utils/pricing';
import PriceTag from './PriceTag';
import ProductImage from './ProductImage';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const detailUrl = `/productos/${encodeURIComponent(product.code)}`;
  const isSoldOut = product.stock <= 0;
  const isLowStock = !isSoldOut && product.minStock !== undefined && product.stock < product.minStock;

  return (
    <Card as="article" className="h-100 product-card">
      {isOnOffer(product) && (
        <Badge bg="danger" className="position-absolute m-2">
          -{product.discountPercent}%
        </Badge>
      )}
      <Link to={detailUrl}>
        <ProductImage product={product} className="card-img-top product-card-image" />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h3" className="h6">
          <Link to={detailUrl} className="text-decoration-none">
            {product.name}
          </Link>
        </Card.Title>
        <Card.Text className="text-muted small mb-1">{product.category}</Card.Text>
        {isLowStock && <Card.Text className="text-warning small mb-1">Últimas {product.stock} unidades</Card.Text>}
        <Card.Text>
          <PriceTag product={product} />
        </Card.Text>
        <Button variant="outline-primary" className="mt-auto" disabled={isSoldOut} onClick={() => addItem(product)}>
          {isSoldOut ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </Card.Body>
    </Card>
  );
}
