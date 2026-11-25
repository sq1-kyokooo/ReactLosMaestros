import { useState } from 'react';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import { useOperation } from '../useOperation';
import EmployeeForm, { EMPTY_EMPLOYEE } from './EmployeeForm';
import { employeeService } from '../../services/employeeService';
import type { Employee } from '../../types';

export default function AddEmployeePanel() {
  const { result, isRunning, run } = useOperation();
  const [formKey, setFormKey] = useState(0);

  const save = async (employee: Employee) => {
    const outcome = await run(() => employeeService.addEmployee(employee));
    if (outcome.ok) setFormKey((key) => key + 1);
  };

  return (
    <AdminPanel title="Agregar empleado">
      <EmployeeForm
        key={formKey}
        initialEmployee={EMPTY_EMPLOYEE}
        isRutEditable
        submitLabel="Guardar empleado"
        confirmQuestion={(e) => `¿Deseas registrar al empleado ${e.name}?`}
        isSaving={isRunning}
        onConfirmedSubmit={save}
      />
      <ResultMessage result={result} />
    </AdminPanel>
  );
}
