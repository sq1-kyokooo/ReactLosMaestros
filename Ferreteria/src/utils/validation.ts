import type { CheckoutForm, FieldErrors } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSON_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,}$/;

export function validateCheckout(form: CheckoutForm): FieldErrors<CheckoutForm> {
  const errors: FieldErrors<CheckoutForm> = {};
  if (form.fullName.trim().length < 3) errors.fullName = 'Ingresa tu nombre completo.';
  if (!EMAIL_PATTERN.test(form.email)) errors.email = 'Ingresa un correo electrónico válido.';
  if (form.delivery === 'shipping') {
    if (!form.address.trim()) errors.address = 'Ingresa una dirección.';
    if (!form.commune.trim()) errors.commune = 'Ingresa una comuna.';
  }
  return errors;
}

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  rut: string;
  phone: string;
  message: string;
}

export function validateContact(form: ContactForm): FieldErrors<ContactForm> {
  const errors: FieldErrors<ContactForm> = {};
  if (!PERSON_NAME_PATTERN.test(form.firstName.trim())) errors.firstName = 'Ingresa un nombre válido.';
  if (!PERSON_NAME_PATTERN.test(form.lastName.trim())) errors.lastName = 'Ingresa un apellido válido.';
  if (!EMAIL_PATTERN.test(form.email)) errors.email = 'Ingresa un correo electrónico válido.';
  if (!/^\d{7,8}-[\dKk]$/.test(form.rut)) errors.rut = 'Ingresa un RUT sin puntos y con guion.';
  if (!/^\d{9}$/.test(form.phone)) errors.phone = 'Ingresa un celular de 9 dígitos.';
  if (form.message.length > 500) errors.message = 'El mensaje no puede superar 500 caracteres.';
  return errors;
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0;
