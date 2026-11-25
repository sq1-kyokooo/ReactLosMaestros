import { validateCheckout, validateContact, type ContactForm } from './validation';
import type { CheckoutForm } from '../types';

describe('validateCheckout', () => {
  const valid: CheckoutForm = {
    fullName: 'Pedro Pérez',
    email: 'pedro@correo.cl',
    delivery: 'shipping',
    address: 'Calle 123',
    commune: 'Pudahuel',
  };

  it('accepts complete data and skips the address for pickup', () => {
    expect(validateCheckout(valid)).toEqual({});
    expect(validateCheckout({ ...valid, delivery: 'pickup', address: '', commune: '' })).toEqual({});
  });

  it('flags every invalid field', () => {
    const errors = validateCheckout({ ...valid, fullName: 'Pe', email: 'nope', address: ' ', commune: '' });

    expect(Object.keys(errors)).toEqual(['fullName', 'email', 'address', 'commune']);
  });
});

describe('validateContact', () => {
  const valid: ContactForm = {
    firstName: 'Pedro',
    lastName: 'Pérez',
    email: 'pedro@correo.cl',
    rut: '12345678-9',
    phone: '912345678',
    message: '',
  };

  it('accepts valid data', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('flags every invalid field', () => {
    const errors = validateContact({
      firstName: 'Pe2',
      lastName: '',
      email: 'a@b',
      rut: '12.345.678-9',
      phone: 'abc',
      message: 'x'.repeat(501),
    });

    expect(Object.keys(errors)).toEqual(['firstName', 'lastName', 'email', 'rut', 'phone', 'message']);
  });
});
