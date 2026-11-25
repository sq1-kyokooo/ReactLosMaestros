// import.meta.env is only defined under Vite; the Karma/webpack test build leaves it undefined.
const env: Partial<ImportMetaEnv> = import.meta.env ?? {};

export const API_BASE_URL = env.VITE_API_URL ?? 'http://localhost:8081/api';

// Mock mode stays on until the backend exists. Set VITE_USE_MOCK_API=false to hit the gateway.
export const USE_MOCK_API = env.VITE_USE_MOCK_API !== 'false';

export const AUTH0_CONFIG = {
  domain: env.VITE_AUTH0_DOMAIN ?? 'dev-vx0d4nhti2zb58wx.us.auth0.com',
  clientId: env.VITE_AUTH0_CLIENT_ID ?? 'YPVzTmCg1hoHReiS9q6moERaTtvr0w7r',
  audience: env.VITE_AUTH0_AUDIENCE ?? 'https://api.ferreteria.com',
};
