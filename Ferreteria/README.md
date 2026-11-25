# Ferretería Los Maestros — Frontend

React + TypeScript + Vite. Auth with Auth0, permissions come from the access token's `permissions` claim.

## Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Dev server on http://localhost:5173       |
| `npm run build`     | Production build                          |
| `npm run typecheck` | TypeScript check (strict)                 |
| `npm test`          | Karma + Jasmine in headless Firefox       |

## Backend / mock mode

All requests go to the API gateway at `http://localhost:8081/api` (see `src/api/endpoints.ts`).
Until the backend exists, services run against localStorage mocks. Copy `.env.example` to `.env.local` and set
`VITE_USE_MOCK_API=false` to talk to the gateway instead.

| Area             | Gateway path               | Permission                  |
| ---------------- | -------------------------- | --------------------------- |
| Catalog (read)   | `/products/**`             | public                      |
| Admin products   | `/crud/products/**`        | `manage:products`           |
| Admin employees  | `/admin/**`                | `manage:users`              |
| Checkout         | `/payments/user/**`        | `write:payments`            |
| Contractor buy   | `/payments/contractor/**`  | `write:contractor_payments` |

## Layout

```
src/
  api/        HTTP client + endpoint paths
  auth/       Auth0 provider, permissions context, ProtectedRoute
  services/   catalog, inventory, employees, payments (mock + API implementations)
  cart/       cart state (context) and the cart drawer
  admin/      admin dashboard, sidebar and panels
  pages/      routed pages
  components/ shared UI
  data/       mock seed data
```
