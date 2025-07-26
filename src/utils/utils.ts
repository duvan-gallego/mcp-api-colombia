import { ToolError } from "./common/api-errors.js";
import { log } from "./common/logging.js";
import { ToolResponse } from "./common/schemas.js";
import { z } from "zod";

export function createToolResponse(
  data: unknown,
  isError = false,
): ToolResponse {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data),
      },
    ],
    isError,
    _meta: {},
  };
}

export function handleToolError(error: unknown, context: string): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  log.error(`${context} failed`, { error: errorMessage });

  if (error instanceof z.ZodError) {
    throw new ToolError(`Invalid input: ${context}`, error.format());
  }

  throw new ToolError(`${context} failed: ${errorMessage}`);
}

export async function executeApiCall<T>(
  apiCall: () => Promise<T>,
  context: string,
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    handleToolError(error, context);
  }
}