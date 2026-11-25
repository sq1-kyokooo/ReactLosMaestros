import Alert from 'react-bootstrap/Alert';
import type { OperationResult } from '../types';

export default function ResultMessage({ result }: { result: OperationResult | null }) {
  if (!result) return null;
  return (
    <Alert variant={result.ok ? 'success' : 'danger'} className="mt-3" role="status">
      {result.message}
    </Alert>
  );
}
