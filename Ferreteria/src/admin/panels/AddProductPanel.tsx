import { useState, type ChangeEvent, type FormEvent } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import AdminPanel from '../AdminPanel';
import ResultMessage from '../ResultMessage';
import { useOperation } from '../useOperation';
import { inventoryService, MAX_PRODUCT_PHOTOS } from '../../services/inventoryService';

export default function AddProductPanel() {
  const { result, isRunning, run } = useOperation();
  const [photos, setPhotos] = useState<File[]>([]);
  const canAddMorePhotos = photos.length < MAX_PRODUCT_PHOTOS;

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setPhotos((current) => [...current, ...selected]);
    event.target.value = '';
  };

  const removePhoto = (index: number) => setPhotos((current) => current.filter((_, i) => i !== index));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const field = (name: string) => String(new FormData(form).get(name) ?? '').trim();

    const outcome = await run(() =>
      inventoryService.addProduct({
        code: field('code'),
        name: field('name'),
        category: field('category'),
        brand: field('brand'),
        provider: field('provider'),
        price: Number(field('price')),
        stock: Number(field('stock')),
        photos,
      }),
    );
    if (outcome.ok) {
      form.reset();
      setPhotos([]);
    }
  };

  return (
    <AdminPanel title="Agregar producto">
      <Form onSubmit={submit}>
        <Form.Group className="mb-3" controlId="new-product-code">
          <Form.Label>Código</Form.Label>
          <Form.Control name="code" placeholder="Ej: MC011" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-name">
          <Form.Label>Nombre</Form.Label>
          <Form.Control name="name" placeholder="Ej: Cemento especial" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-category">
          <Form.Label>Categoría</Form.Label>
          <Form.Control name="category" placeholder="Ej: Mat. Construcción" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-brand">
          <Form.Label>Marca</Form.Label>
          <Form.Control name="brand" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-provider">
          <Form.Label>Proveedor</Form.Label>
          <Form.Control name="provider" placeholder="Ej: Distribuidora Andes" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-price">
          <Form.Label>Precio de venta</Form.Label>
          <Form.Control name="price" type="number" min="1" placeholder="Ej: 6500" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-stock">
          <Form.Label>Stock inicial</Form.Label>
          <Form.Control name="stock" type="number" min="0" step="1" placeholder="Ej: 50" required />
        </Form.Group>
        <Form.Group className="mb-3" controlId="new-product-photos">
          <Form.Label>
            Fotos ({photos.length}/{MAX_PRODUCT_PHOTOS})
          </Form.Label>
          <Form.Control type="file" accept="image/*" multiple onChange={addPhotos} disabled={!canAddMorePhotos} />
          {photos.length > 0 && (
            <ListGroup className="mt-2">
              {photos.map((photo, index) => (
                <ListGroup.Item key={`${photo.name}-${index}`} className="d-flex justify-content-between align-items-center">
                  <span className="text-truncate">{photo.name}</span>
                  <Button size="sm" variant="link" className="text-danger" onClick={() => removePhoto(index)}>
                    Quitar
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Form.Group>
        <Button type="submit" disabled={isRunning}>
          Guardar producto
        </Button>
      </Form>
      <ResultMessage result={result} />
    </AdminPanel>
  );
}
