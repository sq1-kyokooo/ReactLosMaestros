import { useState } from "react";
import { updatePrice, type Result } from "../../../Services/InventoryService";
import ResultMessage from "./ResultMessage";

//panel encargado de actualizar el precio de un producto existente
export default function EditProductPanel(){
    const [result, setResult] = useState<Result | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) =>{
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        const res = updatePrice(
            String(data.codigo ?? "").trim(),
            Number(data.price)
        );
        setResult(res);
        if (res.ok) {
            form.reset();
        }
    }

    return(
        <div className="edit-product-panel">
            <h1>Editar Precio</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="codigo">Código Producto:</label>
                <input type="text" name="codigo" id="codigo" required />
                <br /><br />
                <label htmlFor="price">Nuevo Precio:</label>
                <input type="number" name="price" id="price" min="1" required />
                <br /><br />
                <button id="updated-prod-button" type="submit">Confirmar Edicion</button>
            </form>
            <ResultMessage result={result} />
        </div>
    )
}
