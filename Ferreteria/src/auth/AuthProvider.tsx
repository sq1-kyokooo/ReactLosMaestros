import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider, useAuth0, type AppState } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../config';
import { registerAccessTokenProvider } from '../api/httpClient';
import { PermissionsProvider } from './PermissionsContext';

function ShareAccessTokenWithApi() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    registerAccessTokenProvider(isAuthenticated ? () => getAccessTokenSilently() : null);
  }, [isAuthenticated, getAccessTokenSilently]);

  return null;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const returnToPageBeforeLogin = (appState?: AppState) => {
    navigate(appState?.returnTo ?? '/', { replace: true });
  };

  return (
    <Auth0Provider
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      authorizationParams={{ redirect_uri: window.location.origin, audience: AUTH0_CONFIG.audience }}
      onRedirectCallback={returnToPageBeforeLogin}
    >
      <ShareAccessTokenWithApi />
      <PermissionsProvider>{children}</PermissionsProvider>
    </Auth0Provider>
  );
}
