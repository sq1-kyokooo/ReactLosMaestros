import type { ReactNode } from 'react';
import Card from 'react-bootstrap/Card';

export default function AdminPanel({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section>
      <h1 className="admin-panel-title">{title}</h1>
      <Card className={wide ? '' : 'admin-form-card'}>
        <Card.Body>{children}</Card.Body>
      </Card>
    </section>
  );
}
