import { addProduct, updatePrice, deleteProduct, type Product } from './InventoryService';

describe('InventoryService', () => {
  const crearProducto = (overrides: Partial<Product> = {}): Product => ({
    codigo: 'P001',
    categoria: 'Herramientas',
    nombre: 'Martillo',
    marca: 'Acme',
    precioVenta: 5000,
    stock: 10,
    ...overrides
  });

  const guardar = (productos: Product[]) =>
    localStorage.setItem('prod', JSON.stringify(productos));

  const leer = (): Product[] => JSON.parse(localStorage.getItem('prod')!);

  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // addProduct()
  // ==========================================
  describe('addProduct()', () => {
    it('agrega un producto válido cuando el inventario está vacío', () => {
      const producto = crearProducto();

      const res = addProduct(producto);

      expect(res.ok).toBe(true);
      expect(res.message).toBe('Producto P001 agregado.');
      expect(leer()).toEqual([producto]);
    });

    it('agrega un producto sin eliminar los existentes', () => {
      const existente = crearProducto({ codigo: 'P001' });
      const nuevo = crearProducto({ codigo: 'P002' });
      guardar([existente]);

      expect(addProduct(nuevo).ok).toBe(true);
      expect(leer()).toEqual([existente, nuevo]);
    });

    it('rechaza un código duplicado', () => {
      guardar([crearProducto()]);

      const res = addProduct(crearProducto({ nombre: 'Otro' }));

      expect(res.ok).toBe(false);
      expect(res.message).toBe('Ya existe un producto con el código P001.');
      expect(leer().length).toBe(1);
    });

    const camposObligatorios: (keyof Product)[] = ['codigo', 'nombre', 'categoria', 'marca'];
    camposObligatorios.forEach((campo) => {
      it(`rechaza ${campo} vacío o solo con espacios`, () => {
        const res = addProduct(crearProducto({ [campo]: '   ' }));

        expect(res.ok).toBe(false);
        expect(res.message).toBe('Todos los campos son obligatorios.');
        expect(localStorage.getItem('prod')).toBeNull();
      });
    });

    [NaN, 0, -1].forEach((precio) => {
      it(`rechaza el precio ${precio}`, () => {
        const res = addProduct(crearProducto({ precioVenta: precio }));

        expect(res.ok).toBe(false);
        expect(res.message).toBe('El precio debe ser mayor a 0.');
        expect(localStorage.getItem('prod')).toBeNull();
      });
    });

    [NaN, -1, 1.5].forEach((stock) => {
      it(`rechaza el stock ${stock}`, () => {
        const res = addProduct(crearProducto({ stock }));

        expect(res.ok).toBe(false);
        expect(localStorage.getItem('prod')).toBeNull();
      });
    });

    it('acepta stock cero', () => {
      expect(addProduct(crearProducto({ stock: 0 })).ok).toBe(true);
    });

    it('informa un error si el inventario guardado está corrupto', () => {
      localStorage.setItem('prod', '{json inválido');

      const res = addProduct(crearProducto());

      expect(res.ok).toBe(false);
      expect(res.message).toBe('No se pudo acceder al inventario.');
    });

    it('informa un error si no se puede guardar en localStorage', () => {
      spyOn(Storage.prototype, 'setItem').and.throwError('Error de almacenamiento');

      expect(addProduct(crearProducto()).ok).toBe(false);
    });
  });

  // ==========================================
  // updatePrice()
  // ==========================================
  describe('updatePrice()', () => {
    [NaN, 0, -100].forEach((precio) => {
      it(`rechaza el precio ${precio}`, () => {
        guardar([crearProducto()]);

        expect(updatePrice('P001', precio).ok).toBe(false);
        expect(leer()[0].precioVenta).toBe(5000);
      });
    });

    it('rechaza un código vacío', () => {
      expect(updatePrice('', 1000)).toEqual({ ok: false, message: 'Ingresa un código.' });
    });

    it('retorna error si el inventario está vacío', () => {
      expect(updatePrice('P001', 1000).ok).toBe(false);
    });

    it('retorna error si el producto no existe', () => {
      guardar([crearProducto({ codigo: 'P002' })]);

      const res = updatePrice('P001', 1000);

      expect(res.ok).toBe(false);
      expect(res.message).toBe('No existe un producto con el código P001.');
    });

    it('actualiza solo el precio del producto correcto', () => {
      guardar([
        crearProducto({ codigo: 'P001', precioVenta: 5000 }),
        crearProducto({ codigo: 'P002', precioVenta: 8000 })
      ]);

      const res = updatePrice('P001', 6500);

      expect(res).toEqual({ ok: true, message: 'Precio de P001 actualizado.' });
      expect(leer()[0].precioVenta).toBe(6500);
      expect(leer()[1].precioVenta).toBe(8000);
    });

    it('informa un error si el inventario guardado está corrupto', () => {
      localStorage.setItem('prod', '{json inválido');

      expect(updatePrice('P001', 1000).ok).toBe(false);
    });
  });

  // ==========================================
  // deleteProduct()
  // ==========================================
  describe('deleteProduct()', () => {
    it('elimina solo el producto indicado', () => {
      const otro = crearProducto({ codigo: 'P002' });
      guardar([crearProducto(), otro]);

      const res = deleteProduct('P001');

      expect(res).toEqual({ ok: true, message: 'Producto P001 eliminado.' });
      expect(leer()).toEqual([otro]);
    });

    it('rechaza un código vacío', () => {
      expect(deleteProduct('').ok).toBe(false);
    });

    it('retorna error si el producto no existe', () => {
      guardar([crearProducto()]);

      const res = deleteProduct('P999');

      expect(res.ok).toBe(false);
      expect(res.message).toBe('No existe un producto con el código P999.');
      expect(leer().length).toBe(1);
    });

    it('informa un error si el inventario guardado está corrupto', () => {
      localStorage.setItem('prod', '{json inválido');

      expect(deleteProduct('P001').ok).toBe(false);
    });
  });
});
