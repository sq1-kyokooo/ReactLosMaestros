import { fireEvent, screen } from '@testing-library/react';
import AddProductPanel from './AddProductPanel';
import EditPricePanel from './EditPricePanel';
import DeleteProductPanel from './DeleteProductPanel';
import ProductListPanel from './ProductListPanel';
import { MOCK_KEYS } from '../../services/mockStorage';
import { makeProduct, renderWithProviders } from '../../testUtils';
import type { Product } from '../../types';

const storeProducts = (products: Product[]) => localStorage.setItem(MOCK_KEYS.products, JSON.stringify(products));
const storedProducts = (): Product[] => JSON.parse(localStorage.getItem(MOCK_KEYS.products)!);
const typeInto = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const photo = (name: string) => new File(['fake-image'], name, { type: 'image/png' });
const choosePhotos = (...files: File[]) => fireEvent.change(screen.getByLabelText(/^Fotos/), { target: { files } });

function fillNewProduct(code: string) {
  typeInto('Código', code);
  typeInto('Nombre', 'Cemento especial');
  typeInto('Categoría', 'Mat. Construcción');
  typeInto('Marca', 'Polpaico');
  typeInto('Proveedor', 'Distribuidora Andes');
  typeInto('Precio de venta', '6500');
  typeInto('Stock inicial', '50');
}

describe('product admin panels', () => {
  beforeEach(() => storeProducts([makeProduct({ code: 'MC001', name: 'Cemento', price: 5990 })]));
  afterEach(() => localStorage.clear());

  describe('ProductListPanel', () => {
    it('lists the stored products', async () => {
      renderWithProviders(<ProductListPanel />);

      expect(await screen.findByText('Cemento')).toBeTruthy();
      expect(screen.getByText('MC001')).toBeTruthy();
    });

    it('says when the inventory is empty', async () => {
      storeProducts([]);
      renderWithProviders(<ProductListPanel />);

      expect(await screen.findByText('No hay productos registrados en el inventario.')).toBeTruthy();
    });
  });

  describe('AddProductPanel', () => {
    it('saves a product with provider and photos, then clears the form', async () => {
      renderWithProviders(<AddProductPanel />);
      fillNewProduct('MC011');
      choosePhotos(photo('frente.png'), photo('lado.png'));

      expect(screen.getByText('Fotos (2/5)')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

      expect(await screen.findByText('Producto MC011 agregado.')).toBeTruthy();
      const added = storedProducts()[1];
      expect(added.provider).toBe('Distribuidora Andes');
      expect(added.imageUrls?.length).toBe(2);
      expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe('');
      expect(screen.getByText('Fotos (0/5)')).toBeTruthy();
    });

    it('requires at least one photo', async () => {
      renderWithProviders(<AddProductPanel />);
      fillNewProduct('MC011');

      fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

      expect(await screen.findByText('Agrega entre 1 y 5 fotos.')).toBeTruthy();
    });

    it('lets the admin remove a chosen photo and blocks picking more than 5', () => {
      renderWithProviders(<AddProductPanel />);
      choosePhotos(...['1', '2', '3', '4', '5'].map((n) => photo(`${n}.png`)));

      expect((screen.getByLabelText(/^Fotos/) as HTMLInputElement).disabled).toBeTrue();
      fireEvent.click(screen.getAllByRole('button', { name: 'Quitar' })[0]);

      expect(screen.queryByText('1.png')).toBeNull();
      expect((screen.getByLabelText(/^Fotos/) as HTMLInputElement).disabled).toBeFalse();
    });

    it('shows the duplicate-code error and keeps the form', async () => {
      renderWithProviders(<AddProductPanel />);
      fillNewProduct('MC001');
      choosePhotos(photo('a.png'));

      fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

      expect(await screen.findByText('Ya existe un producto con el código MC001.')).toBeTruthy();
      expect((screen.getByLabelText('Código') as HTMLInputElement).value).toBe('MC001');
    });
  });

  describe('EditPricePanel', () => {
    it('updates the price', async () => {
      renderWithProviders(<EditPricePanel />);
      typeInto('Código del producto', 'MC001');
      typeInto('Nuevo precio', '7000');

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar edición' }));

      expect(await screen.findByText('Precio de MC001 actualizado.')).toBeTruthy();
      expect(storedProducts()[0].price).toBe(7000);
    });

    it('reports an unknown product', async () => {
      renderWithProviders(<EditPricePanel />);
      typeInto('Código del producto', 'NOPE');
      typeInto('Nuevo precio', '7000');

      fireEvent.click(screen.getByRole('button', { name: 'Confirmar edición' }));

      expect(await screen.findByText('No existe un producto con el código NOPE.')).toBeTruthy();
    });
  });

  describe('DeleteProductPanel', () => {
    it('asks for confirmation before deleting', async () => {
      renderWithProviders(<DeleteProductPanel />);
      typeInto('Código del producto', 'MC001');

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar producto' }));
      expect(storedProducts().length).toBe(1);

      fireEvent.click(await screen.findByRole('button', { name: 'Sí, eliminar' }));

      expect(await screen.findByText('Producto MC001 eliminado.')).toBeTruthy();
      expect(storedProducts()).toEqual([]);
    });

    it('keeps the product when the deletion is cancelled', async () => {
      renderWithProviders(<DeleteProductPanel />);
      typeInto('Código del producto', 'MC001');

      fireEvent.click(screen.getByRole('button', { name: 'Eliminar producto' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));

      expect(storedProducts().length).toBe(1);
    });
  });
});
