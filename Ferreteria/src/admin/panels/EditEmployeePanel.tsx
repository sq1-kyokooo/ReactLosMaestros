import { useState } from 'react';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import { useOperation } from '../useOperation';
import EmployeeForm from './EmployeeForm';
import EmployeePicker from './EmployeePicker';
import LoadStatus from '../../components/LoadStatus';
import { employeeService } from '../../services/employeeService';
import { useAsync } from '../../hooks/useAsync';
import type { Employee } from '../../types';

export default function EditEmployeePanel() {
  const { data: employees, isLoading, error, reload } = useAsync(() => employeeService.listEmployees());
  const [selected, setSelected] = useState<Employee | null>(null);
  const { result, isRunning, run, clearResult } = useOperation();

  const pick = (employee: Employee | null) => {
    clearResult();
    setSelected(employee);
  };

  const save = async (employee: Employee) => {
    const outcome = await run(() => employeeService.updateEmployee(employee));
    if (outcome.ok) reload();
  };

  return (
    <AdminPanel title="Editar empleado">
      <LoadStatus isLoading={isLoading} error={error} />
      {employees && <EmployeePicker employees={employees} onPick={pick} />}
      {selected && (
        <EmployeeForm
          key={selected.rut}
          initialEmployee={selected}
          isRutEditable={false}
          submitLabel="Guardar cambios"
          confirmQuestion={(e) => `¿Deseas guardar los cambios de ${e.name}?`}
          isSaving={isRunning}
          onConfirmedSubmit={save}
        />
      )}
      <ResultMessage result={result} />
    </AdminPanel>
  );
}
