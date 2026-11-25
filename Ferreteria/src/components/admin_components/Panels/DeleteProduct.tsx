import { useState } from "react";
import { deleteProduct, type Result } from "../../../Services/InventoryService";
import ResultMessage from "./ResultMessage";

//panel encargado de eliminar un producto, pidiendo confirmacion antes
export default function DeleteProductPanel(){
    const [codigo, setCodigo] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResult(null);
        setConfirming(true);
    }

    const confirmDelete = () => {
        const res = deleteProduct(codigo.trim());
        setResult(res);
        setConfirming(false);
        if (res.ok) {
            setCodigo('');
        }
    }

    return(
        <div className="delete-product-panel">
            <h1>Eliminar Producto</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="delete-codigo">Código Producto:</label>
                <input
                    type="text"
                    id="delete-codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                />
                <br /><br />
                <button type="submit" className="btn-cancelar">Eliminar Producto</button>
            </form>
            <ResultMessage result={result} />

            {confirming && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirmación</h3>
                        <p>¿Seguro que deseas eliminar el producto <strong>{codigo.trim()}</strong>?</p>
                        <div className="modal-botones">
                            <button type="button" onClick={confirmDelete} className="btn-cancelar">Sí, eliminar</button>
                            <button type="button" onClick={() => setConfirming(false)} className="btn-aceptar">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
