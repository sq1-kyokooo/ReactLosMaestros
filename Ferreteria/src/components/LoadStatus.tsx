import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

export default function LoadStatus({ isLoading, error }: { isLoading: boolean; error: string | null }) {
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (isLoading) return <Spinner animation="border" role="status" aria-label="Cargando" />;
  return null;
}
