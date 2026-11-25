import { Link, NavLink } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useAuth0 } from '@auth0/auth0-react';
import logo from '../assets/logo.jfif';
import { useCart } from '../cart/CartContext';
import { usePermissions } from '../auth/PermissionsContext';
import { ADMIN_PERMISSIONS, hasAnyPermission } from '../auth/permissions';
import { summarizeCart } from '../utils/pricing';

export default function Header() {
  const { items, openCart } = useCart();
  const { isAuthenticated } = useAuth0();
  const { permissions } = usePermissions();
  const cartUnits = summarizeCart(items).units;
  const canSeeAdmin = hasAnyPermission(permissions, ADMIN_PERMISSIONS);

  return (
    <Navbar expand="lg" className="store-navbar" data-bs-theme="dark" collapseOnSelect sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="" className="store-logo me-2" />
          Ferretería Los Maestros
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-menu" aria-label="Abrir navegación" />
        <Navbar.Collapse id="main-menu">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={NavLink} to="/" end eventKey="home">
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/productos" end eventKey="catalog">
              Productos
            </Nav.Link>
            <Nav.Link as={Link} to="/productos?ofertas=1" eventKey="offers">
              Ofertas
            </Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros" eventKey="about">
              Nosotros
            </Nav.Link>
            {canSeeAdmin && (
              <Nav.Link as={NavLink} to="/admin" eventKey="admin">
                Admin
              </Nav.Link>
            )}
            {isAuthenticated && (
              <Nav.Link as={NavLink} to="/mis-compras" eventKey="orders">
                Mis compras
              </Nav.Link>
            )}
            <Nav.Link as={NavLink} to="/login" eventKey="account">
              {isAuthenticated ? 'Mi cuenta' : 'Ingresar'}
            </Nav.Link>
            <Button variant="outline-light" className="ms-lg-2" onClick={openCart}>
              Carrito <Badge bg="light" text="dark">{cartUnits}</Badge>
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
