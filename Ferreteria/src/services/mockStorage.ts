export const MOCK_KEYS = {
  products: 'mock:products',
  employees: 'mock:employees',
  orders: 'mock:orders',
} as const;

export function readMockList<T>(key: string, seed: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored === null) {
    return seed.map((item) => ({ ...item }));
  }
  const parsed = JSON.parse(stored);
  if (!Array.isArray(parsed)) {
    throw new Error(`Mock data under "${key}" is not a list.`);
  }
  return parsed;
}

export function writeMockList<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}
