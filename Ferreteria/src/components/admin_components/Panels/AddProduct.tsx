import { useState } from "react";
import { addProduct, type Result } from "../../../Services/InventoryService";
import ResultMessage from "./ResultMessage";

//panel encargado de generar el formulario para agregar un nuevo producto
export default function AddProductPanel() {
    const [result, setResult] = useState<Result | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        const res = addProduct({
            codigo: String(data.codigo ?? "").trim(),
            categoria: String(data.categoria ?? "").trim(),
            nombre: String(data.nombre ?? "").trim(),
            marca: String(data.marca ?? "").trim(),
            precioVenta: Number(data.precioVenta),
            stock: Number(data.stock)
        });
        setResult(res);
        if (res.ok) {
            form.reset();
        }
    }

    return(
        <div className="add-product-panel">
            <h1>Agregar Producto</h1>
            <form id="form-add-product" onSubmit={handleSubmit}>
                <label htmlFor="new-codigo">Código del Producto:</label> <br/>
                <input type="text" id="new-codigo" name="codigo" placeholder="Ej: MC011" required />
                <br/>
                <label htmlFor="new-nombre">Nombre del Producto:</label><br />
                <input type="text" id="new-nombre" name="nombre" placeholder="Ej: Cemento Especial" required />
                <br />

                <label htmlFor="new-categoria">Categoría:</label><br/>
                <input type="text" id="new-categoria" name="categoria" placeholder="Ej: Mat. Construcción" required />
                <br/>
                <label htmlFor="new-marca">Marca:</label><br/>
                <input type="text" id="new-marca" name="marca" placeholder="Ej: Marca..." required />
                <br />

                <label htmlFor="new-precio">Precio de Venta:</label><br/>
                <input type="number" id="new-precio" name="precioVenta" placeholder="Ej: 6500" min="1" required />
                <br/>

                <label htmlFor="new-stock">Stock Inicial:</label><br/>
                <input type="number" id="new-stock" name="stock" placeholder="Ej: 50" min="0" step="1" required />
                <br />

                <button type="submit" id="save-product-button">Guardar Producto</button>
            </form>
            <ResultMessage result={result} />
        </div>
    )
}
