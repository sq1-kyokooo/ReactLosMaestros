import Table from 'react-bootstrap/Table';
import AdminPanel from '../AdminPanel';
import LoadStatus from '../../components/LoadStatus';
import { catalogService } from '../../services/catalogService';
import { useAsync } from '../../hooks/useAsync';
import { formatCLP } from '../../utils/pricing';

export default function ProductListPanel() {
  const { data: products, isLoading, error } = useAsync(() => catalogService.listProducts());

  return (
    <AdminPanel title="Inventario de productos" wide>
      <LoadStatus isLoading={isLoading} error={error} />
      {products?.length === 0 && <p>No hay productos registrados en el inventario.</p>}
      {!!products?.length && (
        <Table striped hover responsive className="mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Categoría</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Proveedor</th>
              <th>Precio venta</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.code}>
                <td>{p.code}</td>
                <td>{p.category}</td>
                <td>{p.name}</td>
                <td>{p.brand}</td>
                <td>{p.provider ?? '—'}</td>
                <td>{formatCLP(p.price)}</td>
                <td>{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </AdminPanel>
  );
}
