import { render, screen, fireEvent } from '@testing-library/react';
import EditProductPanel from './EditProduct';

describe('EditProductPanel', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('prod', JSON.stringify([
            { codigo: 'P001', categoria: 'Herramientas', nombre: 'Martillo', marca: 'Acme', precioVenta: 5000, stock: 10 }
        ]));
    });

    const editar = (codigo: string, precio: string) => {
        fireEvent.change(screen.getByLabelText('Código Producto:'), { target: { value: codigo } });
        fireEvent.change(screen.getByLabelText('Nuevo Precio:'), { target: { value: precio } });
        fireEvent.submit(
            screen.getByRole('button', { name: 'Confirmar Edicion' }).closest('form')!
        );
    };

    const precioGuardado = () => JSON.parse(localStorage.getItem('prod')!)[0].precioVenta;

    it('renderiza los campos y el botón', () => {
        render(<EditProductPanel />);

        expect(screen.getByLabelText('Código Producto:')).toBeTruthy();
        expect(screen.getByLabelText('Nuevo Precio:')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Confirmar Edicion' })).toBeTruthy();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('actualiza el precio, muestra éxito y limpia el formulario', () => {
        render(<EditProductPanel />);

        editar('P001', '7500');

        expect(precioGuardado()).toBe(7500);
        expect(screen.getByRole('status').textContent).toBe('Precio de P001 actualizado.');
        expect(screen.getByRole('status').classList).toContain('ok');
        expect((screen.getByLabelText('Código Producto:') as HTMLInputElement).value).toBe('');
    });

    it('muestra un error si el producto no existe', () => {
        render(<EditProductPanel />);

        editar('P999', '7500');

        expect(screen.getByRole('status').textContent).toBe('No existe un producto con el código P999.');
        expect(screen.getByRole('status').classList).toContain('error');
    });

    it('muestra un error y no cambia el precio si es cero o negativo', () => {
        render(<EditProductPanel />);

        editar('P001', '0');
        expect(screen.getByRole('status').textContent).toBe('El precio debe ser mayor a 0.');

        editar('P001', '-100');
        expect(screen.getByRole('status').textContent).toBe('El precio debe ser mayor a 0.');

        expect(precioGuardado()).toBe(5000);
    });

    it('muestra un error si el código está vacío', () => {
        render(<EditProductPanel />);

        editar('   ', '1000');

        expect(screen.getByRole('status').textContent).toBe('Ingresa un código.');
    });
});
