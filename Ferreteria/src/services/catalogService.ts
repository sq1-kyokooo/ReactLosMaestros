import { ApiError, apiRequest } from '../api/httpClient';
import { endpoints } from '../api/endpoints';
import { USE_MOCK_API } from '../config';
import { seedProducts } from '../data/seedProducts';
import type { Product } from '../types';
import { MOCK_KEYS, readMockList } from './mockStorage';

export interface CatalogService {
  listProducts(): Promise<Product[]>;
  findProduct(code: string): Promise<Product | null>;
}

export const mockCatalogService: CatalogService = {
  async listProducts() {
    return readMockList(MOCK_KEYS.products, seedProducts);
  },
  async findProduct(code) {
    return readMockList(MOCK_KEYS.products, seedProducts).find((p) => p.code === code) ?? null;
  },
};

export const apiCatalogService: CatalogService = {
  listProducts() {
    return apiRequest<Product[]>(endpoints.catalog.list);
  },
  async findProduct(code) {
    try {
      return await apiRequest<Product>(endpoints.catalog.byCode(code));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
};

export const catalogService = USE_MOCK_API ? mockCatalogService : apiCatalogService;
