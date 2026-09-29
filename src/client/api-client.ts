import { client } from './generated/client.gen.js';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 200;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class ApiRequestTimeoutError extends ApiRequestError {
  constructor(timeoutMs: number) {
    super(`API request timed out after ${timeoutMs}ms.`);
    this.name = 'ApiRequestTimeoutError';
  }
}

function getPositiveInteger(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function isRetryableMethod(method: string): boolean {
  return method === 'GET' || method === 'HEAD';
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function createResilientFetch(
  fetchImplementation: typeof fetch = globalThis.fetch
): (request: Request) => Promise<Response> {
  const timeoutMs = getPositiveInteger('API_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
  const maxAttempts = getPositiveInteger('API_MAX_ATTEMPTS', DEFAULT_MAX_ATTEMPTS);

  return async (request: Request): Promise<Response> => {
    const attempts = isRetryableMethod(request.method) ? maxAttempts : 1;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchImplementation(
          new Request(request, { signal: controller.signal })
        );
        if (response.ok) {
          return response;
        }

        if (attempt < attempts && isRetryableStatus(response.status)) {
          await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
          continue;
        }

        throw new ApiRequestError(
          `API request failed with status ${response.status}.`,
          response.status
        );
      } catch (error) {
        if (controller.signal.aborted) {
          throw new ApiRequestTimeoutError(timeoutMs);
        }

        if (error instanceof ApiRequestError || attempt === attempts) {
          throw error;
        }

        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new ApiRequestError('API request failed.');
  };
}

let configured = false;

export function configureApiClient(): void {
  if (configured) {
    return;
  }

  client.setConfig({
    fetch: createResilientFetch(),
    throwOnError: true,
  });
  configured = true;
}
