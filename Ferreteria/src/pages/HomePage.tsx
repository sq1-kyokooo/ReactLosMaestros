import { Link } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import banner from '../assets/banner.jfif';
import ProductCard from '../components/ProductCard';
import LoadStatus from '../components/LoadStatus';
import { catalogService } from '../services/catalogService';
import { useAsync } from '../hooks/useAsync';

const FEATURED_CODES = ['HE006', 'HM007', 'HM002', 'PT004', 'PT005', 'MC001'];

export default function HomePage() {
  const { data: products, isLoading, error } = useAsync(() => catalogService.listProducts());
  const featured = (products ?? []).filter((p) => FEATURED_CODES.includes(p.code));

  return (
    <>
      <section className="py-5 text-center">
        <Container>
          <h1 className="display-5 fw-bold">Ferretería Los Maestros</h1>
          <p className="lead">Materiales, herramientas y todo para tu proyecto en casa.</p>
          <img src={banner} alt="Ofertas imperdibles para el maestro en casa" className="img-fluid rounded mb-3 home-banner" />
          <div>
            <Link to="/productos" className="btn btn-primary btn-lg">
              Ver catálogo
            </Link>
          </div>
        </Container>
      </section>
      <section className="py-4">
        <Container>
          <h2 className="text-center mb-4">Productos destacados</h2>
          <LoadStatus isLoading={isLoading} error={error} />
          <Row className="g-4">
            {featured.map((product) => (
              <Col sm={6} lg={4} key={product.code}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </>
  );
}
