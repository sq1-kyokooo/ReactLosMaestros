import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

export default function NotFoundPage() {
  return (
    <Container as="section" className="py-5">
      <h1>Página no encontrada</h1>
      <p>La dirección que abriste no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </Container>
  );
}
