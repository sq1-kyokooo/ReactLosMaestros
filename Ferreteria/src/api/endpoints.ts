// Paths are relative to API_BASE_URL. Required permissions mirror the gateway's Security.java.
export const endpoints = {
  catalog: {
    list: '/products', // public
    byCode: (code: string) => `/products/${encodeURIComponent(code)}`, // public
  },
  inventory: {
    // manage:products
    create: '/crud/products', // multipart/form-data: product fields + provider + 1..5 "photos" files
    updatePrice: (code: string) => `/crud/products/${encodeURIComponent(code)}/price`,
    remove: (code: string) => `/crud/products/${encodeURIComponent(code)}`,
  },
  employees: {
    // manage:users
    list: '/admin/employees',
    create: '/admin/employees',
    byRut: (rut: string) => `/admin/employees/${encodeURIComponent(rut)}`,
  },
  payments: {
    // write:payments — the backend takes the buyer from the token's `sub`
    userCheckout: '/payments/user/checkout',
    userOrders: '/payments/user/orders',
    // write:contractor_payments
    contractorCheckout: '/payments/contractor/checkout',
    contractorOrders: '/payments/contractor/orders',
  },
} as const;
