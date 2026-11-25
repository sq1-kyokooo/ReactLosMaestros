import { useState, type ChangeEvent, type FormEvent } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import type { FieldErrors } from '../types';
import { hasErrors, validateContact, type ContactForm as ContactFields } from '../utils/validation';

const EMPTY_FORM: ContactFields = { firstName: '', lastName: '', email: '', rut: '', phone: '', message: '' };

const FIELDS: { name: keyof ContactFields; label: string; type: string; placeholder?: string }[] = [
  { name: 'firstName', label: 'Nombre', type: 'text' },
  { name: 'lastName', label: 'Apellido', type: 'text' },
  { name: 'email', label: 'Correo electrónico', type: 'email' },
  { name: 'rut', label: 'RUT', type: 'text', placeholder: 'Ej: 12345678-9' },
  { name: 'phone', label: 'Celular', type: 'tel' },
];

// No backend endpoint for contact yet: the form validates and confirms locally.
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<ContactFields>>({});
  const [wasSent, setWasSent] = useState(false);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setWasSent(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validateContact(form);
    setErrors(validationErrors);
    if (!hasErrors(validationErrors)) {
      setWasSent(true);
      setForm(EMPTY_FORM);
    }
  };

  return (
    <Form onSubmit={submit} noValidate className="contact-form">
      {wasSent && (
        <Alert variant="success" role="status">
          ¡Mensaje enviado! Nos pondremos en contacto contigo a la brevedad.
        </Alert>
      )}
      {FIELDS.map(({ name, label, type, placeholder }) => (
        <Form.Group key={name} controlId={`contact-${name}`} className="mb-3">
          <Form.Label>{label}</Form.Label>
          <Form.Control
            type={type}
            name={name}
            placeholder={placeholder}
            value={form[name]}
            onChange={updateField}
            isInvalid={Boolean(errors[name])}
          />
          <Form.Control.Feedback type="invalid">{errors[name]}</Form.Control.Feedback>
        </Form.Group>
      ))}
      <Form.Group controlId="contact-message" className="mb-3">
        <Form.Label>Mensaje (opcional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="message"
          value={form.message}
          onChange={updateField}
          isInvalid={Boolean(errors.message)}
        />
        <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
      </Form.Group>
      <Button type="submit">Enviar mensaje</Button>
    </Form>
  );
}
