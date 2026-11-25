import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import { useOperation } from '../useOperation';
import EmployeePicker from './EmployeePicker';
import ConfirmModal from '../../components/ConfirmModal';
import LoadStatus from '../../components/LoadStatus';
import { employeeService } from '../../services/employeeService';
import { useAsync } from '../../hooks/useAsync';
import type { Employee } from '../../types';

export default function DeleteEmployeePanel() {
  const { data: employees, isLoading, error, reload } = useAsync(() => employeeService.listEmployees());
  const [selected, setSelected] = useState<Employee | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const { result, isRunning, run, clearResult } = useOperation();

  const pick = (employee: Employee | null) => {
    clearResult();
    setSelected(employee);
  };

  const deleteConfirmed = async () => {
    if (!selected) return;
    setIsConfirming(false);
    const outcome = await run(() => employeeService.deleteEmployee(selected.rut));
    if (outcome.ok) {
      setSelected(null);
      setPickerKey((key) => key + 1);
      reload();
    }
  };

  return (
    <AdminPanel title="Eliminar empleado">
      <LoadStatus isLoading={isLoading} error={error} />
      {employees && <EmployeePicker key={pickerKey} employees={employees} onPick={pick} />}
      {selected && (
        <Alert variant="warning">
          <p className="fw-bold">Estás a punto de eliminar a este empleado:</p>
          <p className="mb-1">Nombre: {selected.name}</p>
          <p className="mb-1">RUT: {selected.rut}</p>
          <p className="mb-1">Cargo: {selected.position}</p>
          <p>Correo: {selected.email}</p>
          <Button variant="danger" disabled={isRunning} onClick={() => setIsConfirming(true)}>
            Eliminar definitivamente
          </Button>
        </Alert>
      )}
      <ResultMessage result={result} />
      <ConfirmModal
        show={isConfirming}
        title="Confirmar eliminación"
        confirmLabel="Sí, eliminar"
        confirmVariant="danger"
        onConfirm={deleteConfirmed}
        onCancel={() => setIsConfirming(false)}
      >
        ¿Seguro que deseas eliminar a <strong>{selected?.name}</strong>? Esta acción no se puede deshacer.
      </ConfirmModal>
    </AdminPanel>
  );
}
