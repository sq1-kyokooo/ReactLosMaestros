export interface Product {
    codigo: string;
    categoria?: string;
    nombre: string;
    marca?: string;
    precioVenta: number;
    stock: number;
}

// resultado de cada operacion: si salio bien y el mensaje para mostrar al usuario
export interface Result {
    ok: boolean;
    message: string;
}

const KEY = 'prod';

function readProducts(): Product[] {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}

function saveProducts(products: Product[]) {
    localStorage.setItem(KEY, JSON.stringify(products));
}

// atrapa errores de localStorage (JSON corrupto, almacenamiento lleno)
function safe(action: () => Result): Result {
    try {
        return action();
    } catch {
        return { ok: false, message: 'No se pudo acceder al inventario.' };
    }
}

function validatePrice(price: number): boolean {
    return Number.isFinite(price) && price > 0;
}

function validateProduct(p: Product): string | null {
    if (!p.codigo?.trim() || !p.nombre?.trim() || !p.categoria?.trim() || !p.marca?.trim()) {
        return 'Todos los campos son obligatorios.';
    }
    if (!validatePrice(p.precioVenta)) {
        return 'El precio debe ser mayor a 0.';
    }
    if (!Number.isInteger(p.stock) || p.stock < 0) {
        return 'El stock debe ser un número entero mayor o igual a 0.';
    }
    return null;
}

export function addProduct(product: Product): Result {
    const error = validateProduct(product);
    if (error) {
        return { ok: false, message: error };
    }
    return safe(() => {
        const products = readProducts();
        if (products.some((p) => p.codigo === product.codigo)) {
            return { ok: false, message: `Ya existe un producto con el código ${product.codigo}.` };
        }
        saveProducts([...products, product]);
        return { ok: true, message: `Producto ${product.codigo} agregado.` };
    });
}

export function updatePrice(codigo: string, newPrice: number): Result {
    if (!codigo) {
        return { ok: false, message: 'Ingresa un código.' };
    }
    if (!validatePrice(newPrice)) {
        return { ok: false, message: 'El precio debe ser mayor a 0.' };
    }
    return safe(() => {
        const products = readProducts();
        const product = products.find((p) => p.codigo === codigo);
        if (!product) {
            return { ok: false, message: `No existe un producto con el código ${codigo}.` };
        }
        product.precioVenta = newPrice;
        saveProducts(products);
        return { ok: true, message: `Precio de ${codigo} actualizado.` };
    });
}

export function deleteProduct(codigo: string): Result {
    if (!codigo) {
        return { ok: false, message: 'Ingresa un código.' };
    }
    return safe(() => {
        const products = readProducts();
        const remaining = products.filter((p) => p.codigo !== codigo);
        if (remaining.length === products.length) {
            return { ok: false, message: `No existe un producto con el código ${codigo}.` };
        }
        saveProducts(remaining);
        return { ok: true, message: `Producto ${codigo} eliminado.` };
    });
}
