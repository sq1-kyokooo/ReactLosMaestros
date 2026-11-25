import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import type { Employee } from '../../types';

interface EmployeePickerProps {
  employees: Employee[];
  onPick: (employee: Employee | null) => void;
}

export default function EmployeePicker({ employees, onPick }: EmployeePickerProps) {
  const [rut, setRut] = useState('');

  const updateRut = (value: string) => {
    setRut(value);
    onPick(employees.find((e) => e.rut === value) ?? null);
  };

  return (
    <Form.Group className="mb-4" controlId="employee-picker">
      <Form.Label>Buscar empleado por RUT</Form.Label>
      <Form.Control
        list="employee-ruts"
        value={rut}
        onChange={(e) => updateRut(e.target.value)}
        placeholder="Escriba o seleccione un RUT..."
      />
      <datalist id="employee-ruts">
        {employees.map((e) => (
          <option key={e.rut} value={e.rut}>
            {e.name} - {e.position}
          </option>
        ))}
      </datalist>
    </Form.Group>
  );
}
