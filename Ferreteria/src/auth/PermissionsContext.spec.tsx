import { fireEvent, render, screen } from '@testing-library/react';
import { Auth0Context, initialContext, type Auth0ContextInterface } from '@auth0/auth0-react';
import { PermissionsProvider, usePermissions } from './PermissionsContext';
import { fakeAccessToken } from '../testUtils';

function ShowPermissions() {
  const { permissions, isLoading, reloadPermissions } = usePermissions();
  return (
    <>
      <p>{isLoading ? 'cargando' : `permisos: ${permissions.join(',') || 'ninguno'}`}</p>
      <button onClick={reloadPermissions}>reload</button>
    </>
  );
}

function renderWithTokens(getAccessTokenSilently: jasmine.Spy) {
  const auth = {
    ...initialContext,
    isLoading: false,
    isAuthenticated: true,
    getAccessTokenSilently,
  } as unknown as Auth0ContextInterface;
  return render(
    <Auth0Context.Provider value={auth}>
      <PermissionsProvider>
        <ShowPermissions />
      </PermissionsProvider>
    </Auth0Context.Provider>,
  );
}

describe('PermissionsProvider', () => {
  it('uses the cached token when it already has permissions', async () => {
    const getToken = jasmine.createSpy('getAccessTokenSilently').and.resolveTo(fakeAccessToken(['write:payments']));

    renderWithTokens(getToken);

    expect(await screen.findByText('permisos: write:payments')).toBeTruthy();
    expect(getToken).toHaveBeenCalledTimes(1);
  });

  it('asks for a fresh token once when the first one has no permissions (first login)', async () => {
    const getToken = jasmine
      .createSpy('getAccessTokenSilently')
      .and.callFake((options?: { cacheMode?: string }) =>
        Promise.resolve(fakeAccessToken(options?.cacheMode === 'off' ? ['write:payments', 'read:profile'] : [])),
      );

    renderWithTokens(getToken);

    expect(await screen.findByText('permisos: write:payments,read:profile')).toBeTruthy();
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(getToken.calls.argsFor(1)).toEqual([{ cacheMode: 'off' }]);
  });

  it('stays without permissions if the fresh token is empty too, and can retry on demand', async () => {
    const getToken = jasmine.createSpy('getAccessTokenSilently').and.resolveTo(fakeAccessToken([]));
    renderWithTokens(getToken);
    await screen.findByText('permisos: ninguno');

    getToken.and.resolveTo(fakeAccessToken(['write:payments']));
    fireEvent.click(screen.getByText('reload'));

    expect(await screen.findByText('permisos: write:payments')).toBeTruthy();
    expect(getToken.calls.mostRecent().args).toEqual([{ cacheMode: 'off' }]);
  });

  it('treats a token error as no permissions', async () => {
    renderWithTokens(jasmine.createSpy('getAccessTokenSilently').and.rejectWith(new Error('login_required')));

    expect(await screen.findByText('permisos: ninguno')).toBeTruthy();
  });
});
