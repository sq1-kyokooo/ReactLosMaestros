import { useState } from 'react';
import type { OperationResult } from '../types';

export function useOperation() {
  const [result, setResult] = useState<OperationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = async (operation: () => Promise<OperationResult>): Promise<OperationResult> => {
    setIsRunning(true);
    setResult(null);
    const outcome = await operation();
    setResult(outcome);
    setIsRunning(false);
    return outcome;
  };

  return { result, isRunning, run, clearResult: () => setResult(null) };
}
