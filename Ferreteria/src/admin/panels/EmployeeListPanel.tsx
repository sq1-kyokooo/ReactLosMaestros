import Table from 'react-bootstrap/Table';
import AdminPanel from '../AdminPanel';
import LoadStatus from '../../components/LoadStatus';
import { employeeService } from '../../services/employeeService';
import { useAsync } from '../../hooks/useAsync';

export default function EmployeeListPanel() {
  const { data: employees, isLoading, error } = useAsync(() => employeeService.listEmployees());

  return (
    <AdminPanel title="Lista de empleados" wide>
      <LoadStatus isLoading={isLoading} error={error} />
      {employees?.length === 0 && <p>No hay empleados registrados en el sistema.</p>}
      {!!employees?.length && (
        <Table striped hover responsive className="mb-0">
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.rut}>
                <td>{e.rut}</td>
                <td>{e.name}</td>
                <td>{e.position}</td>
                <td>{e.email}</td>
                <td>{e.phone}</td>
                <td>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPanel>
  );
}
