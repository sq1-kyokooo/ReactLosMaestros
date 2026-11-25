import { useState, type ChangeEvent, type FormEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ConfirmModal from '../../components/ConfirmModal';
import type { Employee } from '../../types';

export const EMPTY_EMPLOYEE: Employee = { rut: '', name: '', position: '', phone: '', email: '', status: 'Activo' };

interface EmployeeFormProps {
  initialEmployee: Employee;
  isRutEditable: boolean;
  submitLabel: string;
  confirmQuestion: (employee: Employee) => string;
  isSaving: boolean;
  onConfirmedSubmit: (employee: Employee) => void;
}

export default function EmployeeForm({
  initialEmployee,
  isRutEditable,
  submitLabel,
  confirmQuestion,
  isSaving,
  onConfirmedSubmit,
}: EmployeeFormProps) {
  const [employee, setEmployee] = useState(initialEmployee);
  const [isConfirming, setIsConfirming] = useState(false);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEmployee((current) => ({ ...current, [name]: value }));
  };

  const askForConfirmation = (event: FormEvent) => {
    event.preventDefault();
    setIsConfirming(true);
  };

  const submitConfirmed = () => {
    setIsConfirming(false);
    onConfirmedSubmit({ ...employee, name: employee.name.trim(), position: employee.position.trim() });
  };

  return (
    <>
      <Form onSubmit={askForConfirmation} noValidate>
        <Form.Group className="mb-3" controlId="employee-rut">
          <Form.Label>RUT</Form.Label>
          <Form.Control name="rut" value={employee.rut} onChange={updateField} disabled={!isRutEditable} placeholder="12345678-9" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="employee-name">
          <Form.Label>Nombre completo</Form.Label>
          <Form.Control name="name" value={employee.name} onChange={updateField} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="employee-position">
          <Form.Label>Cargo</Form.Label>
          <Form.Control name="position" value={employee.position} onChange={updateField} placeholder="Ej: Vendedor" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="employee-phone">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control name="phone" value={employee.phone} onChange={updateField} placeholder="987654321" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="employee-email">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control name="email" type="email" value={employee.email} onChange={updateField} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="employee-status">
          <Form.Label>Estado</Form.Label>
          <Form.Select name="status" value={employee.status} onChange={updateField}>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit" disabled={isSaving}>
          {submitLabel}
        </Button>
      </Form>
      <ConfirmModal
        show={isConfirming}
        title="Confirmación"
        onConfirm={submitConfirmed}
        onCancel={() => setIsConfirming(false)}
      >
        {confirmQuestion(employee)}
      </ConfirmModal>
    </>
  );
}
