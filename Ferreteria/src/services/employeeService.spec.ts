import { apiEmployeeService, mockEmployeeService, validateEmployee } from './employeeService';
import { MOCK_KEYS } from './mockStorage';
import { registerAccessTokenProvider } from '../api/httpClient';
import { API_BASE_URL } from '../config';
import type { Employee } from '../types';

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  rut: '12345678-9',
  name: 'Pedro Pérez',
  position: 'Vendedor',
  email: 'pedro@correo.cl',
  phone: '912345678',
  status: 'Activo',
  ...overrides,
});

const storeEmployees = (employees: Employee[]) => localStorage.setItem(MOCK_KEYS.employees, JSON.stringify(employees));
const storedEmployees = (): Employee[] => JSON.parse(localStorage.getItem(MOCK_KEYS.employees)!);

describe('validateEmployee', () => {
  it('accepts a valid employee, including a K check digit', () => {
    expect(validateEmployee(makeEmployee())).toBeNull();
    expect(validateEmployee(makeEmployee({ rut: '1234567-K' }))).toBeNull();
  });

  const invalidCases: [Partial<Employee>, string][] = [
    [{ rut: '12.345.678-9' }, 'RUT inválido. Usa el formato 12345678-9.'],
    [{ name: 'Pedro123' }, 'Nombre inválido.'],
    [{ position: '  ' }, 'Ingresa un cargo.'],
    [{ phone: '12345' }, 'Teléfono inválido. Debe tener 9 dígitos.'],
    [{ email: 'pedro@' }, 'Correo inválido.'],
  ];
  invalidCases.forEach(([override, message]) => {
    it(`rejects ${JSON.stringify(override)}`, () => {
      expect(validateEmployee(makeEmployee(override))).toBe(message);
    });
  });
});

describe('mockEmployeeService', () => {
  beforeEach(() => storeEmployees([makeEmployee()]));
  afterEach(() => localStorage.clear());

  it('seeds the list when storage is empty', async () => {
    localStorage.clear();

    expect((await mockEmployeeService.listEmployees()).length).toBeGreaterThan(0);
  });

  it('adds a new employee', async () => {
    const result = await mockEmployeeService.addEmployee(makeEmployee({ rut: '11111111-1', name: 'Ana' }));

    expect(result.ok).toBeTrue();
    expect(storedEmployees().length).toBe(2);
  });

  it('rejects a duplicated RUT', async () => {
    const result = await mockEmployeeService.addEmployee(makeEmployee());

    expect(result.message).toBe('El RUT 12345678-9 ya está registrado.');
  });

  it('updates an existing employee', async () => {
    const result = await mockEmployeeService.updateEmployee(makeEmployee({ position: 'Supervisor' }));

    expect(result.ok).toBeTrue();
    expect(storedEmployees()[0].position).toBe('Supervisor');
  });

  it('fails to update an unknown employee', async () => {
    expect((await mockEmployeeService.updateEmployee(makeEmployee({ rut: '99999999-9' }))).ok).toBeFalse();
  });

  it('deletes an employee', async () => {
    expect((await mockEmployeeService.deleteEmployee('12345678-9')).ok).toBeTrue();
    expect(storedEmployees()).toEqual([]);
  });

  it('fails to delete an unknown employee', async () => {
    expect((await mockEmployeeService.deleteEmployee('99999999-9')).ok).toBeFalse();
  });
});

describe('apiEmployeeService', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    registerAccessTokenProvider(() => Promise.resolve('token-123'));
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }));
  });
  afterEach(() => registerAccessTokenProvider(null));

  it('lists employees from /admin/employees with the token', async () => {
    fetchSpy.and.resolveTo(new Response(JSON.stringify([makeEmployee()]), { status: 200 }));

    const employees = await apiEmployeeService.listEmployees();

    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${API_BASE_URL}/admin/employees`);
    expect(init.headers.Authorization).toBe('Bearer token-123');
    expect(employees).toEqual([makeEmployee()]);
  });

  it('PUTs updates to the employee URL', async () => {
    await apiEmployeeService.updateEmployee(makeEmployee());

    const [url, init] = fetchSpy.calls.mostRecent().args;
    expect(url).toBe(`${API_BASE_URL}/admin/employees/12345678-9`);
    expect(init.method).toBe('PUT');
  });
});
