import { apiInventoryService, mockInventoryService } from './inventoryService';
import { MOCK_KEYS } from './mockStorage';
import { registerAccessTokenProvider } from '../api/httpClient';
import { API_BASE_URL } from '../config';
import { makeProduct } from '../testUtils';
import type { NewProduct, Product } from '../types';

const photo = (name = 'martillo.png', type = 'image/png') => new File(['fake-image'], name, { type });

const newProduct = (overrides: Partial<NewProduct> = {}): NewProduct => ({
  code: 'P001',
  name: 'Martillo',
  category: 'Herramientas',
  brand: 'Acme',
  provider: 'Distribuidora Andes',
  price: 5000,
  stock: 10,
  photos: [photo()],
  ...overrides,
});

const storeProducts = (products: Product[]) => localStorage.setItem(MOCK_KEYS.products, JSON.stringify(products));
const storedProducts = (): Product[] => JSON.parse(localStorage.getItem(MOCK_KEYS.products)!);

describe('mockInventoryService', () => {
  beforeEach(() => storeProducts([]));
  afterEach(() => localStorage.clear());

  describe('addProduct', () => {
    it('adds a valid product with its provider and photos', async () => {
      const result = await mockInventoryService.addProduct(newProduct({ photos: [photo('a.png'), photo('b.png')] }));

      const [saved] = storedProducts();
      expect(result).toEqual(jasmine.objectContaining({ ok: true, message: 'Producto P001 agregado.' }));
      expect(saved.provider).toBe('Distribuidora Andes');
      expect(saved.imageUrls?.length).toBe(2);
      expect(saved.imageUrl).toBe(saved.imageUrls![0]);
      expect(saved.imageUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('keeps existing products', async () => {
      storeProducts([makeProduct({ code: 'P000' })]);

      await mockInventoryService.addProduct(newProduct());

      expect(storedProducts().map((p) => p.code)).toEqual(['P000', 'P001']);
    });

    it('rejects a duplicated code', async () => {
      storeProducts([makeProduct()]);

      const result = await mockInventoryService.addProduct(newProduct({ name: 'Otro' }));

      expect(result.ok).toBeFalse();
      expect(result.message).toBe('Ya existe un producto con el código P001.');
    });

    (['code', 'name', 'category', 'brand', 'provider'] as const).forEach((field) => {
      it(`rejects a blank ${field}`, async () => {
        const result = await mockInventoryService.addProduct(newProduct({ [field]: '   ' }));

        expect(result).toEqual(jasmine.objectContaining({ ok: false, message: 'Todos los campos son obligatorios.' }));
      });
    });

    [NaN, 0, -1].forEach((price) => {
      it(`rejects price ${price}`, async () => {
        expect((await mockInventoryService.addProduct(newProduct({ price }))).message).toBe('El precio debe ser mayor a 0.');
      });
    });

    [NaN, -1, 1.5].forEach((stock) => {
      it(`rejects stock ${stock}`, async () => {
        expect((await mockInventoryService.addProduct(newProduct({ stock }))).ok).toBeFalse();
      });
    });

    it('requires between 1 and 5 photos', async () => {
      const sixPhotos = Array.from({ length: 6 }, (_, i) => photo(`${i}.png`));

      expect((await mockInventoryService.addProduct(newProduct({ photos: [] }))).message).toBe('Agrega entre 1 y 5 fotos.');
      expect((await mockInventoryService.addProduct(newProduct({ photos: sixPhotos }))).message).toBe('Agrega entre 1 y 5 fotos.');
      expect((await mockInventoryService.addProduct(newProduct({ photos: sixPhotos.slice(0, 5) }))).ok).toBeTrue();
    });

    it('rejects files that are not images', async () => {
      const result = await mockInventoryService.addProduct(newProduct({ photos: [photo('doc.pdf', 'application/pdf')] }));

      expect(result.message).toBe('Las fotos deben ser imágenes.');
    });

    it('accepts zero stock', async () => {
      expect((await mockInventoryService.addProduct(newProduct({ stock: 0 }))).ok).toBeTrue();
    });

    it('reports corrupted storage', async () => {
      localStorage.setItem(MOCK_KEYS.products, '{bad json');

      expect((await mockInventoryService.addProduct(newProduct())).message).toBe('No se pudo acceder al inventario.');
    });
  });

  describe('updatePrice', () => {
    it('updates only the matching product', async () => {
      storeProducts([makeProduct({ code: 'P001', price: 5000 }), makeProduct({ code: 'P002', price: 8000 })]);

      const result = await mockInventoryService.updatePrice('P001', 6500);

      expect(result.message).toBe('Precio de P001 actualizado.');
      expect(storedProducts().map((p) => p.price)).toEqual([6500, 8000]);
    });

    it('rejects an empty code', async () => {
      expect((await mockInventoryService.updatePrice('', 1000)).message).toBe('Ingresa un código.');
    });

    it('rejects an invalid price without touching the product', async () => {
      storeProducts([makeProduct()]);

      expect((await mockInventoryService.updatePrice('P001', 0)).ok).toBeFalse();
      expect(storedProducts()[0].price).toBe(5000);
    });

    it('reports a missing product', async () => {
      expect((await mockInventoryService.updatePrice('P999', 1000)).message).toBe('No existe un producto con el código P999.');
    });
  });

  describe('deleteProduct', () => {
    it('removes only the matching product', async () => {
      const other = makeProduct({ code: 'P002' });
      storeProducts([makeProduct(), other]);

      const result = await mockInventoryService.deleteProduct('P001');

      expect(result.message).toBe('Producto P001 eliminado.');
      expect(storedProducts()).toEqual([other]);
    });

    it('reports a missing product', async () => {
      expect((await mockInventoryService.deleteProduct('P999')).ok).toBeFalse();
    });
  });
});

describe('apiInventoryService', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    registerAccessTokenProvider(() => Promise.resolve('token-123'));
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }));
  });
  afterEach(() => registerAccessTokenProvider(null));

  it('POSTs new products as multipart with provider and every photo', async () => {
    const photos = [photo('a.png'), photo('b.png')];
    const result = await apiInventoryService.addProduct(newProduct({ photos }));

    const [url, init] = fetchSpy.calls.mostRecent().args;
    const body = init.body as FormData;
    expect(result.ok).toBeTrue();
    expect(url).toBe(`${API_BASE_URL}/crud/products`);
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer token-123');
    expect(init.headers['Content-Type']).toBeUndefined();
    expect(body.get('code')).toBe('P001');
    expect(body.get('provider')).toBe('Distribuidora Andes');
    expect(body.get('price')).toBe('5000');
    expect((body.getAll('photos') as File[]).map((f) => f.name)).toEqual(['a.png', 'b.png']);
  });

  it('validates before calling the API', async () => {
    const result = await apiInventoryService.addProduct(newProduct({ price: 0 }));

    expect(result.ok).toBeFalse();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('PATCHes the new price', async () => {
    await apiInventoryService.updatePrice('P 1', 990);

    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${API_BASE_URL}/crud/products/P%201/price`);
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ price: 990 });
  });

  it('turns a 403 into a permissions message', async () => {
    fetchSpy.and.resolveTo(new Response(null, { status: 403 }));

    const result = await apiInventoryService.deleteProduct('P001');

    expect(result).toEqual(jasmine.objectContaining({ ok: false, message: 'No tienes permisos para esta acción.' }));
  });
});
