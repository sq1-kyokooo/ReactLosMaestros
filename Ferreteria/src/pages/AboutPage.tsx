import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ContactForm from '../components/ContactForm';

const VALUES = [
  { title: 'Compromiso', text: 'Nos ponemos la camiseta en cada proyecto del cliente para buscar la solución adecuada.' },
  { title: 'Honestidad', text: 'Ofrecemos precios justos y una recomendación sincera sobre qué producto comprar.' },
  { title: 'Cercanía', text: 'Tratamos a cada comprador como parte de nuestra familia.' },
];

export default function AboutPage() {
  return (
    <Container as="section" className="py-4">
      <h1>Quiénes somos</h1>
      <p className="lead">Fundada con la visión de entregar soluciones integrales para el hogar.</p>
      <h2 className="h4">Nuestro objetivo</h2>
      <p>Ser la ferretería líder y de mayor confianza de la región.</p>
      <h2 className="h4 mt-4">Nuestros valores</h2>
      <Row className="g-3 mb-5">
        {VALUES.map(({ title, text }) => (
          <Col md={4} key={title}>
            <Card className="h-100">
              <Card.Body>
                <h3 className="h5">{title}</h3>
                <p className="mb-0">{text}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <h2 className="h4" id="contacto">
        Contáctanos
      </h2>
      <ContactForm />
    </Container>
  );
}
