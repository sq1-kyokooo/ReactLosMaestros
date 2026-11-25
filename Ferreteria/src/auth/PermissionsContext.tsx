import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { permissionsFromToken } from './permissions';

interface PermissionsState {
  permissions: string[];
  isLoading: boolean;
  reloadPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsState | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { isLoading: isAuthLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [tokenPermissions, setTokenPermissions] = useState<string[] | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    let isCurrent = true;
    const skipCache = reloadCount > 0;
    loadPermissions(getAccessTokenSilently, skipCache).then((permissions) => {
      if (isCurrent) setTokenPermissions(permissions);
    });
    return () => {
      isCurrent = false;
    };
  }, [isAuthLoading, isAuthenticated, getAccessTokenSilently, reloadCount]);

  const reloadPermissions = useCallback(() => {
    setTokenPermissions(null);
    setReloadCount((count) => count + 1);
  }, []);

  let state: Omit<PermissionsState, 'reloadPermissions'>;
  if (isAuthLoading) state = { permissions: [], isLoading: true };
  else if (!isAuthenticated) state = { permissions: [], isLoading: false };
  else state = { permissions: tokenPermissions ?? [], isLoading: tokenPermissions === null };

  return <PermissionsContext.Provider value={{ ...state, reloadPermissions }}>{children}</PermissionsContext.Provider>;
}

type GetAccessToken = ReturnType<typeof useAuth0>['getAccessTokenSilently'];

// On a user's first login the Auth0 Action assigns the default role after the token was issued,
// so an empty token gets one retry that bypasses the SDK cache and asks Auth0 for a fresh token.
async function loadPermissions(getAccessToken: GetAccessToken, skipCache: boolean): Promise<string[]> {
  try {
    const permissions = permissionsFromToken(await getAccessToken(skipCache ? { cacheMode: 'off' } : undefined));
    if (permissions.length > 0 || skipCache) return permissions;
    return permissionsFromToken(await getAccessToken({ cacheMode: 'off' }));
  } catch {
    return [];
  }
}

export function usePermissions(): PermissionsState {
  const context = useContext(PermissionsContext);
  if (!context) throw new Error('usePermissions must be used inside <PermissionsProvider>.');
  return context;
}
