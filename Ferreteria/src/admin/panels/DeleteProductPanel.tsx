import { useState, type FormEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import ConfirmModal from '../../components/ConfirmModal';
import { useOperation } from '../useOperation';
import { inventoryService } from '../../services/inventoryService';

export default function DeleteProductPanel() {
  const [code, setCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const { result, isRunning, run, clearResult } = useOperation();

  const askForConfirmation = (event: FormEvent) => {
    event.preventDefault();
    clearResult();
    setIsConfirming(true);
  };

  const deleteConfirmed = async () => {
    setIsConfirming(false);
    const outcome = await run(() => inventoryService.deleteProduct(code.trim()));
    if (outcome.ok) setCode('');
  };

  return (
    <AdminPanel title="Eliminar producto">
      <Form onSubmit={askForConfirmation}>
        <Form.Group className="mb-3" controlId="delete-product-code">
          <Form.Label>Código del producto</Form.Label>
          <Form.Control value={code} onChange={(e) => setCode(e.target.value)} required />
        </Form.Group>
        <Button type="submit" variant="danger" disabled={isRunning}>
          Eliminar producto
        </Button>
      </Form>
      <ResultMessage result={result} />
      <ConfirmModal
        show={isConfirming}
        title="Confirmar eliminación"
        confirmLabel="Sí, eliminar"
        confirmVariant="danger"
        onConfirm={deleteConfirmed}
        onCancel={() => setIsConfirming(false)}
      >
        ¿Seguro que deseas eliminar el producto <strong>{code.trim()}</strong>?
      </ConfirmModal>
    </AdminPanel>
  );
}
