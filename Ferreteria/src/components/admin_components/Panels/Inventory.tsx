import { TableHeads } from "../Constants";
import type { Product } from "../../../Services/InventoryService";

function readProducts(): Product[] {
    try {
        const prodString = localStorage.getItem('prod');
        return prodString ? JSON.parse(prodString) : [];
    } catch {
        return [];
    }
}

function Panel() {
    const prod = readProducts();

    if (prod.length === 0) {
        return <p className="no-data">No hay productos registrados en el inventario.</p>;
    }
    return (
        <div className="table-scroll-container">
            <table className="inventory-table">
                <thead>
                    <tr>
                        {Object.values(TableHeads).map((columna) => (
                            <th key={columna}>{columna}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {prod.map((p) => (
                        <tr key={p.codigo}>
                            <td><span className="cell-code">{p.codigo}</span></td>
                            <td>{p.categoria || 'N/A'}</td>
                            <td>{p.nombre}</td>
                            <td>{p.marca || 'N/A'}</td>
                            <td className="cell-price">$ {p.precioVenta}</td>
                            <td className="cell-stock">{p.stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default function Inventory() {
    return (
        <div className="inventory-module table-container">
            <h1>Inventario Productos</h1>
            <div className="table">
                <Panel />
            </div>
        </div>
    )
}
