import { fireEvent, screen } from '@testing-library/react';
import AddEmployeePanel from './AddEmployeePanel';
import EditEmployeePanel from './EditEmployeePanel';
import DeleteEmployeePanel from './DeleteEmployeePanel';
import EmployeeListPanel from './EmployeeListPanel';
import { MOCK_KEYS } from '../../services/mockStorage';
import { renderWithProviders } from '../../testUtils';
import type { Employee } from '../../types';

const carlos: Employee = {
  rut: '19876543-2',
  name: 'Carlos Soto',
  position: 'Vendedor',
  email: 'carlos@correo.cl',
  phone: '912345678',
  status: 'Activo',
};

const storedEmployees = (): Employee[] => JSON.parse(localStorage.getItem(MOCK_KEYS.employees)!);
const typeInto = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('employee admin panels', () => {
  beforeEach(() => localStorage.setItem(MOCK_KEYS.employees, JSON.stringify([carlos])));
  afterEach(() => localStorage.clear());

  it('EmployeeListPanel lists employees', async () => {
    renderWithProviders(<EmployeeListPanel />);

    expect(await screen.findByText('Carlos Soto')).toBeTruthy();
  });

  describe('AddEmployeePanel', () => {
    const fillValidEmployee = () => {
      typeInto('RUT', '12345678-9');
      typeInto('Nombre completo', 'Ana Gómez');
      typeInto('Cargo', 'Cajera');
      typeInto('Teléfono', '987654321');
      typeInto('Correo electrónico', 'ana@correo.cl');
    };

    it('registers the employee after confirmation', async () => {
      renderWithProviders(<AddEmployeePanel />);
      fillValidEmployee();

      fireEvent.click(screen.getByRole('button', { name: 'Guardar empleado' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText('Empleado Ana Gómez registrado.')).toBeTruthy();
      expect(storedEmployees().map((e) => e.rut)).toEqual(['19876543-2', '12345678-9']);
    });

    it('shows the validation error inline instead of an alert', async () => {
      renderWithProviders(<AddEmployeePanel />);
      fillValidEmployee();
      typeInto('Teléfono', '123');

      fireEvent.click(screen.getByRole('button', { name: 'Guardar empleado' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

      expect(await screen.findByText('Teléfono inválido. Debe tener 9 dígitos.')).toBeTruthy();
      expect(storedEmployees().length).toBe(1);
    });
  });

  it('EditEmployeePanel edits the picked employee', async () => {
    renderWithProviders(<EditEmployeePanel />);
    fireEvent.change(await screen.findByLabelText('Buscar empleado por RUT'), { target: { value: carlos.rut } });
    typeInto('Cargo', 'Supervisor');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Empleado Carlos Soto actualizado.')).toBeTruthy();
    expect(storedEmployees()[0].position).toBe('Supervisor');
    expect((screen.getByLabelText('RUT') as HTMLInputElement).disabled).toBeTrue();
  });

  it('DeleteEmployeePanel deletes the picked employee after confirmation', async () => {
    renderWithProviders(<DeleteEmployeePanel />);
    fireEvent.change(await screen.findByLabelText('Buscar empleado por RUT'), { target: { value: carlos.rut } });

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Sí, eliminar' }));

    expect(await screen.findByText('Empleado eliminado.')).toBeTruthy();
    expect(storedEmployees()).toEqual([]);
  });
});
