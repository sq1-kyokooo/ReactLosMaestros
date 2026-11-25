import { Link, Outlet } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Header from './Header';
import CartDrawer from '../cart/CartDrawer';
import { useCart } from '../cart/CartContext';

function CartNotice() {
  const { notice, dismissNotice } = useCart();
  if (!notice) return null;
  return (
    <Alert variant={notice.variant} dismissible onClose={dismissNotice} className="mt-3" role="status">
      {notice.text}
    </Alert>
  );
}

function Footer() {
  return (
    <footer className="store-footer py-4 mt-auto">
      <Container className="d-flex flex-wrap justify-content-between gap-2">
        <span>Ferretería Los Maestros · Av. Américo Vespucio 1252, Pudahuel</span>
        <Link to="/nosotros">Quiénes somos · Contacto</Link>
      </Container>
    </footer>
  );
}

export default function StoreLayout() {
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-grow-1">
        <Container>
          <CartNotice />
        </Container>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
