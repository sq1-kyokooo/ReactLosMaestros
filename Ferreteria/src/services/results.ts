import { errorMessageOf } from '../api/httpClient';
import type { OperationResult } from '../types';

export const success = <T = void>(message: string, data?: T): OperationResult<T> => ({ ok: true, message, data });
export const failure = <T = void>(message: string): OperationResult<T> => ({ ok: false, message });

export async function runApiOperation<T>(request: () => Promise<T>, successMessage: string): Promise<OperationResult<T>> {
  try {
    return success(successMessage, await request());
  } catch (error) {
    return failure(errorMessageOf(error));
  }
}
