import { fireEvent, screen } from '@testing-library/react';
import CatalogPage from './CatalogPage';
import { MOCK_KEYS } from '../services/mockStorage';
import { makeProduct, renderWithProviders } from '../testUtils';

const products = [
  makeProduct({ code: 'A1', name: 'Martillo', category: 'Herramientas', price: 5000 }),
  makeProduct({ code: 'A2', name: 'Cemento', category: 'Construcción', price: 6000, discountPercent: 10 }),
  makeProduct({ code: 'A3', name: 'Pala', category: 'Jardín', price: 9000, stock: 0 }),
];

describe('CatalogPage', () => {
  beforeEach(() => localStorage.setItem(MOCK_KEYS.products, JSON.stringify(products)));
  afterEach(() => localStorage.clear());

  it('lists every product', async () => {
    renderWithProviders(<CatalogPage />, { route: '/productos' });

    expect(await screen.findByText('3 productos encontrados')).toBeTruthy();
  });

  it('shows only offers when opened from the Ofertas link', async () => {
    renderWithProviders(<CatalogPage />, { route: '/productos?ofertas=1' });

    expect(await screen.findByText('1 productos encontrados')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Ofertas' })).toBeTruthy();
    expect(screen.getByText('Cemento')).toBeTruthy();
  });

  it('searches ignoring accents and case', async () => {
    renderWithProviders(<CatalogPage />, { route: '/productos' });
    await screen.findByText('3 productos encontrados');

    fireEvent.change(screen.getByLabelText('Buscar producto'), { target: { value: 'CEMÉNTO' } });

    expect(screen.getByText('1 productos encontrados')).toBeTruthy();
  });

  it('filters by availability and clears filters', async () => {
    renderWithProviders(<CatalogPage />, { route: '/productos' });
    await screen.findByText('3 productos encontrados');

    fireEvent.change(screen.getByLabelText('Disponibilidad'), { target: { value: 'soldOut' } });
    expect(screen.getByText('1 productos encontrados')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByText('3 productos encontrados')).toBeTruthy();
  });
});
