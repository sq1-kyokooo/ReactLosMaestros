import { apiRequest } from '../api/httpClient';
import { endpoints } from '../api/endpoints';
import { USE_MOCK_API } from '../config';
import { seedProducts } from '../data/seedProducts';
import type { NewProduct, OperationResult, Product } from '../types';
import { MOCK_KEYS, readMockList, writeMockList } from './mockStorage';
import { failure, runApiOperation, success } from './results';

export interface InventoryService {
  addProduct(product: NewProduct): Promise<OperationResult>;
  updatePrice(code: string, newPrice: number): Promise<OperationResult>;
  deleteProduct(code: string): Promise<OperationResult>;
}

const STORAGE_ERROR = 'No se pudo acceder al inventario.';
const MISSING_CODE = 'Ingresa un código.';
const INVALID_PRICE = 'El precio debe ser mayor a 0.';

const productNotFound = (code: string) => failure(`No existe un producto con el código ${code}.`);

function isValidPrice(price: number) {
  return Number.isFinite(price) && price > 0;
}

export const MIN_PRODUCT_PHOTOS = 1;
export const MAX_PRODUCT_PHOTOS = 5;

export function validateNewProduct(product: NewProduct): string | null {
  const requiredText = [product.code, product.name, product.category, product.brand, product.provider];
  if (requiredText.some((value) => !value?.trim())) {
    return 'Todos los campos son obligatorios.';
  }
  if (!isValidPrice(product.price)) {
    return INVALID_PRICE;
  }
  if (!Number.isInteger(product.stock) || product.stock < 0) {
    return 'El stock debe ser un número entero mayor o igual a 0.';
  }
  if (product.photos.length < MIN_PRODUCT_PHOTOS || product.photos.length > MAX_PRODUCT_PHOTOS) {
    return `Agrega entre ${MIN_PRODUCT_PHOTOS} y ${MAX_PRODUCT_PHOTOS} fotos.`;
  }
  if (product.photos.some((photo) => !photo.type.startsWith('image/'))) {
    return 'Las fotos deben ser imágenes.';
  }
  return null;
}

function toMultipartForm({ photos, ...fields }: NewProduct): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => form.append(key, String(value)));
  photos.forEach((photo) => form.append('photos', photo));
  return form;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function withMockProducts(action: (products: Product[]) => OperationResult): OperationResult {
  try {
    return action(readMockList(MOCK_KEYS.products, seedProducts));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return failure('Las fotos son muy pesadas para guardarlas en modo demo.');
    }
    return failure(STORAGE_ERROR);
  }
}

export const mockInventoryService: InventoryService = {
  async addProduct({ photos, ...fields }) {
    const validationError = validateNewProduct({ ...fields, photos });
    if (validationError) return failure(validationError);

    let imageUrls: string[];
    try {
      imageUrls = await Promise.all(photos.map(readAsDataUrl));
    } catch {
      return failure('No se pudieron leer las fotos.');
    }

    return withMockProducts((products) => {
      if (products.some((p) => p.code === fields.code)) {
        return failure(`Ya existe un producto con el código ${fields.code}.`);
      }
      const product: Product = { ...fields, imageUrl: imageUrls[0], imageUrls };
      writeMockList(MOCK_KEYS.products, [...products, product]);
      return success(`Producto ${fields.code} agregado.`);
    });
  },

  async updatePrice(code, newPrice) {
    if (!code) return failure(MISSING_CODE);
    if (!isValidPrice(newPrice)) return failure(INVALID_PRICE);

    return withMockProducts((products) => {
      const product = products.find((p) => p.code === code);
      if (!product) return productNotFound(code);
      product.price = newPrice;
      writeMockList(MOCK_KEYS.products, products);
      return success(`Precio de ${code} actualizado.`);
    });
  },

  async deleteProduct(code) {
    if (!code) return failure(MISSING_CODE);

    return withMockProducts((products) => {
      const remaining = products.filter((p) => p.code !== code);
      if (remaining.length === products.length) return productNotFound(code);
      writeMockList(MOCK_KEYS.products, remaining);
      return success(`Producto ${code} eliminado.`);
    });
  },
};

export const apiInventoryService: InventoryService = {
  async addProduct(product) {
    const validationError = validateNewProduct(product);
    if (validationError) return failure(validationError);
    return runApiOperation(
      () => apiRequest<void>(endpoints.inventory.create, { method: 'POST', body: toMultipartForm(product), authenticated: true }),
      `Producto ${product.code} agregado.`,
    );
  },

  async updatePrice(code, newPrice) {
    if (!code) return failure(MISSING_CODE);
    if (!isValidPrice(newPrice)) return failure(INVALID_PRICE);
    return runApiOperation(
      () => apiRequest<void>(endpoints.inventory.updatePrice(code), { method: 'PATCH', body: { price: newPrice }, authenticated: true }),
      `Precio de ${code} actualizado.`,
    );
  },

  async deleteProduct(code) {
    if (!code) return failure(MISSING_CODE);
    return runApiOperation<void>(
      () => apiRequest(endpoints.inventory.remove(code), { method: 'DELETE', authenticated: true }),
      `Producto ${code} eliminado.`,
    );
  },
};

export const inventoryService = USE_MOCK_API ? mockInventoryService : apiInventoryService;
