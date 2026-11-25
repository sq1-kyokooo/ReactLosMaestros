export interface Product {
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  brand: string;
  price: number;
  stock: number;
  minStock?: number;
  discountPercent?: number;
  description?: string;
  provider?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export type NewProduct = Pick<Product, 'code' | 'name' | 'category' | 'brand' | 'price' | 'stock'> & {
  provider: string;
  photos: File[];
};

export type EmployeeStatus = 'Activo' | 'Inactivo';

export interface Employee {
  rut: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryMethod = 'shipping' | 'pickup';

export interface CheckoutForm {
  fullName: string;
  email: string;
  delivery: DeliveryMethod;
  address: string;
  commune: string;
}

export interface Order {
  orderNumber: string;
  createdAt: string; // ISO 8601
  items: { code: string; name: string; quantity: number; lineTotal: number }[];
  deliveryAddress: string;
  shippingCost: number;
  total: number;
  email: string;
}

export interface OperationResult<T = void> {
  ok: boolean;
  message: string;
  data?: T;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
