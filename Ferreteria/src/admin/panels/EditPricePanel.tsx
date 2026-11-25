import type { FormEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import { useOperation } from '../useOperation';
import { inventoryService } from '../../services/inventoryService';

export default function EditPricePanel() {
  const { result, isRunning, run } = useOperation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const code = String(data.get('code') ?? '').trim();
    const newPrice = Number(data.get('price'));

    const outcome = await run(() => inventoryService.updatePrice(code, newPrice));
    if (outcome.ok) form.reset();
  };

  return (
    <AdminPanel title="Editar precio">
      <Form onSubmit={submit}>
        <Form.Group className="mb-3" controlId="edit-price-code">
          <Form.Label>Código del producto</Form.Label>
          <Form.Control name="code" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="edit-price-value">
          <Form.Label>Nuevo precio</Form.Label>
          <Form.Control name="price" type="number" min="1" required />
        </Form.Group>
        <Button type="submit" disabled={isRunning}>
          Confirmar edición
        </Button>
      </Form>
      <ResultMessage result={result} />
    </AdminPanel>
  );
}
