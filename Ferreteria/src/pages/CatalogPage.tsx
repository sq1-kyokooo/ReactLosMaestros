import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import ProductCard from '../components/ProductCard';
import LoadStatus from '../components/LoadStatus';
import { catalogService } from '../services/catalogService';
import { useAsync } from '../hooks/useAsync';
import { isOnOffer } from '../utils/pricing';
import type { Product } from '../types';

type Availability = '' | 'inStock' | 'soldOut';

const normalizeForSearch = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function matchesSearch(product: Product, search: string) {
  const searchableText = `${product.name} ${product.brand} ${product.code} ${product.subcategory ?? ''}`;
  return normalizeForSearch(searchableText).includes(normalizeForSearch(search));
}

export default function CatalogPage() {
  const { data: products, isLoading, error } = useAsync(() => catalogService.listProducts());
  const [searchParams, setSearchParams] = useSearchParams();
  const onlyOffers = searchParams.get('ofertas') === '1';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState<Availability>('');
  const [maxPrice, setMaxPrice] = useState('');

  const allProducts = products ?? [];
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();
  const visibleProducts = allProducts.filter(
    (p) =>
      matchesSearch(p, search) &&
      (!category || p.category === category) &&
      (!availability || (availability === 'inStock' ? p.stock > 0 : p.stock === 0)) &&
      (maxPrice === '' || p.price <= Number(maxPrice)) &&
      (!onlyOffers || isOnOffer(p)),
  );

  const setOnlyOffers = (enabled: boolean) => setSearchParams(enabled ? { ofertas: '1' } : {});

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setAvailability('');
    setMaxPrice('');
    setOnlyOffers(false);
  };

  return (
    <Container as="section" className="py-4">
      <h1>{onlyOffers ? 'Ofertas' : 'Catálogo de productos'}</h1>
      <Row className="g-3 align-items-end mb-4">
        <Col sm={6} lg={3}>
          <Form.Group controlId="filter-search">
            <Form.Label>Buscar producto</Form.Label>
            <Form.Control value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, marca o código" />
          </Form.Group>
        </Col>
        <Col sm={6} lg={3}>
          <Form.Group controlId="filter-category">
            <Form.Label>Categoría</Form.Label>
            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6} lg={2}>
          <Form.Group controlId="filter-availability">
            <Form.Label>Disponibilidad</Form.Label>
            <Form.Select value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}>
              <option value="">Todos</option>
              <option value="inStock">Disponible</option>
              <option value="soldOut">Sin stock</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col sm={6} lg={2}>
          <Form.Group controlId="filter-max-price">
            <Form.Label>Precio máximo</Form.Label>
            <Form.Control type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </Form.Group>
        </Col>
        <Col lg={2}>
          <Form.Check
            id="filter-offers"
            type="switch"
            label="Solo ofertas"
            checked={onlyOffers}
            onChange={(e) => setOnlyOffers(e.target.checked)}
          />
          <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </Col>
      </Row>

      <LoadStatus isLoading={isLoading} error={error} />
      {products && (
        <>
          <p role="status">{visibleProducts.length} productos encontrados</p>
          {visibleProducts.length === 0 ? (
            <Alert variant="info">No encontramos productos con esos filtros.</Alert>
          ) : (
            <Row className="g-4">
              {visibleProducts.map((product) => (
                <Col sm={6} lg={4} xl={3} key={product.code}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
}
