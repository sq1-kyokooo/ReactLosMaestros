import Button from 'react-bootstrap/Button';

interface QuantityStepperProps {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
  label: string;
}

export default function QuantityStepper({ quantity, max, onChange, label }: QuantityStepperProps) {
  return (
    <div className="d-flex align-items-center gap-2">
      <Button
        size="sm"
        variant="outline-secondary"
        aria-label={`Quitar una unidad de ${label}`}
        disabled={quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </Button>
      <span aria-label={`Cantidad de ${label}`}>{quantity}</span>
      <Button
        size="sm"
        variant="outline-secondary"
        aria-label={`Agregar una unidad de ${label}`}
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </Button>
    </div>
  );
}
