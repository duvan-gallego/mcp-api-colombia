import { ToolError } from './common/api-errors.js';
import { log } from './common/logging.js';
import { ToolRequest, ToolResponse } from './common/schemas.js';
import {
  ApiRequestError,
  ApiRequestTimeoutError,
  configureApiClient,
} from '../client/api-client.js';
import { z } from 'zod';

export function createToolResponse(data: unknown, isError = false): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data),
      },
    ],
    structuredContent: { data },
    isError,
    _meta: {},
  };
}

export function handleToolError(error: unknown, context: string): never {
  log.error(`${context} failed`, {
    error: error instanceof Error ? error.message : String(error),
    ...(error instanceof ApiRequestError && { upstreamStatus: error.status }),
  });

  if (error instanceof z.ZodError) {
    throw new ToolError(`Invalid input: ${context}`, error.format());
  }

  if (error instanceof ApiRequestTimeoutError) {
    throw new ToolError('API Colombia did not respond in time. Please try again.');
  }

  if (error instanceof ApiRequestError) {
    throw new ToolError('API Colombia is temporarily unavailable. Please try again.');
  }

  throw new ToolError(`${context} failed. Please try again.`);
}

export function validateToolInput<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    handleToolError(error, `Input validation for ${context}`);
  }
}

export async function executeApiCall<T>(apiCall: () => Promise<T>, context: string): Promise<T> {
  configureApiClient();
  try {
    return await apiCall();
  } catch (error) {
    handleToolError(error, context);
  }
}

export function extractArguments<T extends Record<string, unknown>>(request: ToolRequest): T {
  return (request.params.arguments || {}) as T;
}
