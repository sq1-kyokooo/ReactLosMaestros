import type { Result } from "../../../Services/InventoryService";

// muestra el resultado de una operacion del inventario en verde o rojo
export default function ResultMessage({ result }: { result: Result | null }) {
    if (!result) {
        return null;
    }
    return (
        <p className={`result-message ${result.ok ? 'ok' : 'error'}`} role="status">
            {result.message}
        </p>
    );
}
