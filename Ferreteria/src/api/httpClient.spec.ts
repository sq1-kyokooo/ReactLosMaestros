import { apiRequest, registerAccessTokenProvider } from './httpClient';
import { API_BASE_URL } from '../config';

describe('apiRequest', () => {
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ hello: 'world' }), { status: 200 }));
  });
  afterEach(() => registerAccessTokenProvider(null));

  it('calls the gateway base URL and parses JSON', async () => {
    expect(await apiRequest('/products')).toEqual({ hello: 'world' });
    expect(fetchSpy.calls.mostRecent().args[0]).toBe(`${API_BASE_URL}/products`);
  });

  it('does not send a token to public endpoints', async () => {
    registerAccessTokenProvider(() => Promise.resolve('secret'));

    await apiRequest('/products');

    expect(fetchSpy.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
  });

  it('fails authenticated requests when nobody is logged in', async () => {
    await expectAsync(apiRequest('/admin/employees', { authenticated: true })).toBeRejectedWithError('Debes iniciar sesión.');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports a network failure', async () => {
    fetchSpy.and.rejectWith(new TypeError('Failed to fetch'));

    await expectAsync(apiRequest('/products')).toBeRejectedWithError('No se pudo conectar con el servidor.');
  });

  it('falls back to a generic message for non-JSON errors', async () => {
    fetchSpy.and.resolveTo(new Response('boom', { status: 500 }));

    await expectAsync(apiRequest('/products')).toBeRejectedWithError('Error del servidor (500).');
  });
});
