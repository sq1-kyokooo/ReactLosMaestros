import { render, screen, fireEvent } from '@testing-library/react';
import DeleteProductPanel from './DeleteProduct';

describe('DeleteProductPanel', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('prod', JSON.stringify([
            { codigo: 'P001', categoria: 'Herramientas', nombre: 'Martillo', marca: 'Acme', precioVenta: 5000, stock: 10 },
            { codigo: 'P002', categoria: 'Herramientas', nombre: 'Alicate', marca: 'Acme', precioVenta: 3000, stock: 5 }
        ]));
    });

    const pedirEliminar = (codigo: string) => {
        fireEvent.change(screen.getByLabelText('Código Producto:'), { target: { value: codigo } });
        fireEvent.submit(
            screen.getByRole('button', { name: 'Eliminar Producto' }).closest('form')!
        );
    };

    const codigosGuardados = () =>
        JSON.parse(localStorage.getItem('prod')!).map((p: { codigo: string }) => p.codigo);

    it('renderiza el campo y el botón sin modal ni mensaje', () => {
        render(<DeleteProductPanel />);

        expect(screen.getByLabelText('Código Producto:')).toBeTruthy();
        expect(screen.queryByText('Confirmación')).toBeNull();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('pide confirmación antes de eliminar', () => {
        render(<DeleteProductPanel />);

        pedirEliminar('P001');

        expect(screen.getByText('Confirmación')).toBeTruthy();
        expect(codigosGuardados()).toEqual(['P001', 'P002']);
    });

    it('elimina el producto al confirmar y muestra éxito', () => {
        render(<DeleteProductPanel />);

        pedirEliminar('P001');
        fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

        expect(codigosGuardados()).toEqual(['P002']);
        expect(screen.queryByText('Confirmación')).toBeNull();
        expect(screen.getByRole('status').textContent).toBe('Producto P001 eliminado.');
        expect((screen.getByLabelText('Código Producto:') as HTMLInputElement).value).toBe('');
    });

    it('no elimina nada si se cancela', () => {
        render(<DeleteProductPanel />);

        pedirEliminar('P001');
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(codigosGuardados()).toEqual(['P001', 'P002']);
        expect(screen.queryByText('Confirmación')).toBeNull();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('muestra un error si el producto no existe y conserva el código', () => {
        render(<DeleteProductPanel />);

        pedirEliminar('P999');
        fireEvent.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

        expect(screen.getByRole('status').textContent).toBe('No existe un producto con el código P999.');
        expect(screen.getByRole('status').classList).toContain('error');
        expect((screen.getByLabelText('Código Producto:') as HTMLInputElement).value).toBe('P999');
        expect(codigosGuardados()).toEqual(['P001', 'P002']);
    });
});
