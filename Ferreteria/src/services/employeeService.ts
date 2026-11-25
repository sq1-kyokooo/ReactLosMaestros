import { apiRequest } from '../api/httpClient';
import { endpoints } from '../api/endpoints';
import { USE_MOCK_API } from '../config';
import { seedEmployees } from '../data/seedEmployees';
import type { Employee, OperationResult } from '../types';
import { MOCK_KEYS, readMockList, writeMockList } from './mockStorage';
import { failure, runApiOperation, success } from './results';

export interface EmployeeService {
  listEmployees(): Promise<Employee[]>;
  addEmployee(employee: Employee): Promise<OperationResult>;
  updateEmployee(employee: Employee): Promise<OperationResult>;
  deleteEmployee(rut: string): Promise<OperationResult>;
}

const RUT_PATTERN = /^\d{7,8}-[0-9Kk]$/;
const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const PHONE_PATTERN = /^\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployee(employee: Employee): string | null {
  if (!RUT_PATTERN.test(employee.rut)) return 'RUT inválido. Usa el formato 12345678-9.';
  if (!NAME_PATTERN.test(employee.name.trim())) return 'Nombre inválido.';
  if (!employee.position.trim()) return 'Ingresa un cargo.';
  if (!PHONE_PATTERN.test(employee.phone)) return 'Teléfono inválido. Debe tener 9 dígitos.';
  if (!EMAIL_PATTERN.test(employee.email)) return 'Correo inválido.';
  if (employee.status !== 'Activo' && employee.status !== 'Inactivo') return 'Selecciona un estado.';
  return null;
}

const STORAGE_ERROR = 'No se pudo acceder a los empleados.';

function withMockEmployees(action: (employees: Employee[]) => OperationResult): OperationResult {
  try {
    return action(readMockList(MOCK_KEYS.employees, seedEmployees));
  } catch {
    return failure(STORAGE_ERROR);
  }
}

export const mockEmployeeService: EmployeeService = {
  async listEmployees() {
    return readMockList(MOCK_KEYS.employees, seedEmployees);
  },

  async addEmployee(employee) {
    const validationError = validateEmployee(employee);
    if (validationError) return failure(validationError);

    return withMockEmployees((employees) => {
      if (employees.some((e) => e.rut === employee.rut)) {
        return failure(`El RUT ${employee.rut} ya está registrado.`);
      }
      writeMockList(MOCK_KEYS.employees, [...employees, employee]);
      return success(`Empleado ${employee.name} registrado.`);
    });
  },

  async updateEmployee(employee) {
    const validationError = validateEmployee(employee);
    if (validationError) return failure(validationError);

    return withMockEmployees((employees) => {
      if (!employees.some((e) => e.rut === employee.rut)) {
        return failure(`No existe un empleado con el RUT ${employee.rut}.`);
      }
      writeMockList(MOCK_KEYS.employees, employees.map((e) => (e.rut === employee.rut ? employee : e)));
      return success(`Empleado ${employee.name} actualizado.`);
    });
  },

  async deleteEmployee(rut) {
    return withMockEmployees((employees) => {
      const remaining = employees.filter((e) => e.rut !== rut);
      if (remaining.length === employees.length) {
        return failure(`No existe un empleado con el RUT ${rut}.`);
      }
      writeMockList(MOCK_KEYS.employees, remaining);
      return success('Empleado eliminado.');
    });
  },
};

export const apiEmployeeService: EmployeeService = {
  listEmployees() {
    return apiRequest<Employee[]>(endpoints.employees.list, { authenticated: true });
  },

  async addEmployee(employee) {
    const validationError = validateEmployee(employee);
    if (validationError) return failure(validationError);
    return runApiOperation(
      () => apiRequest<void>(endpoints.employees.create, { method: 'POST', body: employee, authenticated: true }),
      `Empleado ${employee.name} registrado.`,
    );
  },

  async updateEmployee(employee) {
    const validationError = validateEmployee(employee);
    if (validationError) return failure(validationError);
    return runApiOperation(
      () => apiRequest<void>(endpoints.employees.byRut(employee.rut), { method: 'PUT', body: employee, authenticated: true }),
      `Empleado ${employee.name} actualizado.`,
    );
  },

  deleteEmployee(rut) {
    return runApiOperation(
      () => apiRequest<void>(endpoints.employees.byRut(rut), { method: 'DELETE', authenticated: true }),
      'Empleado eliminado.',
    );
  },
};

export const employeeService = USE_MOCK_API ? mockEmployeeService : apiEmployeeService;
