import { getFunctions, httpsCallable } from 'firebase/functions';
import type { Functions } from 'firebase/functions';

export class ApiClient {
  private functions: Functions;

  constructor(functions?: Functions) {
    this.functions = functions ?? getFunctions();
  }

  async call<TRequest, TResponse>(
    functionName: string,
    data: TRequest,
  ): Promise<TResponse> {
    const callable = httpsCallable<TRequest, TResponse>(
      this.functions,
      functionName,
    );
    const result = await callable(data);
    return result.data;
  }
}
