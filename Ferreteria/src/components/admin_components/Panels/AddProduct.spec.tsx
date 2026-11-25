import { render, screen, fireEvent } from '@testing-library/react';
import AddProductPanel from './AddProduct';

describe('AddProductPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const completarFormulario = (overrides: Record<string, string> = {}) => {
    const datos = {
      codigo: 'MC011',
      nombre: 'Cemento Especial',
      categoria: 'Construcción',
      marca: 'Acme',
      precioVenta: '6500',
      stock: '50',
      ...overrides
    };

    fireEvent.change(screen.getByLabelText('Código del Producto:'), { target: { value: datos.codigo } });
    fireEvent.change(screen.getByLabelText('Nombre del Producto:'), { target: { value: datos.nombre } });
    fireEvent.change(screen.getByLabelText('Categoría:'), { target: { value: datos.categoria } });
    fireEvent.change(screen.getByLabelText('Marca:'), { target: { value: datos.marca } });
    fireEvent.change(screen.getByLabelText('Precio de Venta:'), { target: { value: datos.precioVenta } });
    fireEvent.change(screen.getByLabelText('Stock Inicial:'), { target: { value: datos.stock } });

    return datos;
  };

  const enviarFormulario = () => {
    fireEvent.submit(document.getElementById('form-add-product') as HTMLFormElement);
  };

  it('renderiza el título, los campos y el botón', () => {
    render(<AddProductPanel />);

    expect(screen.getByText('Agregar Producto')).toBeTruthy();
    expect(screen.getByLabelText('Código del Producto:')).toBeTruthy();
    expect(screen.getByLabelText('Nombre del Producto:')).toBeTruthy();
    expect(screen.getByLabelText('Categoría:')).toBeTruthy();
    expect(screen.getByLabelText('Marca:')).toBeTruthy();
    expect(screen.getByLabelText('Precio de Venta:')).toBeTruthy();
    expect(screen.getByLabelText('Stock Inicial:')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar Producto' })).toBeTruthy();
  });

  it('no muestra mensaje antes de enviar', () => {
    render(<AddProductPanel />);

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('agrega un producto válido, muestra éxito y limpia el formulario', () => {
    render(<AddProductPanel />);
    const datos = completarFormulario();

    enviarFormulario();

    expect(JSON.parse(localStorage.getItem('prod')!)).toEqual([{
      codigo: datos.codigo,
      categoria: datos.categoria,
      nombre: datos.nombre,
      marca: datos.marca,
      precioVenta: 6500,
      stock: 50
    }]);
    const mensaje = screen.getByRole('status');
    expect(mensaje.textContent).toBe('Producto MC011 agregado.');
    expect(mensaje.classList).toContain('ok');
    expect((screen.getByLabelText('Código del Producto:') as HTMLInputElement).value).toBe('');
  });

  it('quita los espacios de los campos de texto', () => {
    render(<AddProductPanel />);
    completarFormulario({ codigo: '  MC012  ' });

    enviarFormulario();

    expect(JSON.parse(localStorage.getItem('prod')!)[0].codigo).toBe('MC012');
  });

  it('conserva los productos existentes', () => {
    localStorage.setItem('prod', JSON.stringify([
      { codigo: 'P001', categoria: 'Herramientas', nombre: 'Martillo', marca: 'Acme', precioVenta: 5000, stock: 10 }
    ]));
    render(<AddProductPanel />);
    completarFormulario({ codigo: 'P002' });

    enviarFormulario();

    const productos = JSON.parse(localStorage.getItem('prod')!);
    expect(productos.map((p: { codigo: string }) => p.codigo)).toEqual(['P001', 'P002']);
  });

  it('muestra un error y mantiene el formulario si el código está duplicado', () => {
    localStorage.setItem('prod', JSON.stringify([
      { codigo: 'MC011', categoria: 'X', nombre: 'X', marca: 'X', precioVenta: 1, stock: 1 }
    ]));
    render(<AddProductPanel />);
    completarFormulario();

    enviarFormulario();

    const mensaje = screen.getByRole('status');
    expect(mensaje.textContent).toBe('Ya existe un producto con el código MC011.');
    expect(mensaje.classList).toContain('error');
    expect((screen.getByLabelText('Código del Producto:') as HTMLInputElement).value).toBe('MC011');
  });

  it('muestra un error si el precio es cero', () => {
    render(<AddProductPanel />);
    completarFormulario({ precioVenta: '0' });

    enviarFormulario();

    expect(screen.getByRole('status').textContent).toBe('El precio debe ser mayor a 0.');
    expect(localStorage.getItem('prod')).toBeNull();
  });

  it('muestra un error si el stock es negativo', () => {
    render(<AddProductPanel />);
    completarFormulario({ stock: '-1' });

    enviarFormulario();

    expect(screen.getByRole('status').classList).toContain('error');
    expect(localStorage.getItem('prod')).toBeNull();
  });
});
