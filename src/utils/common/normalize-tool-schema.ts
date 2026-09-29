import { Tool } from '@modelcontextprotocol/sdk/types.js';

type InputSchema = Tool['inputSchema'];
type SchemaObject = Record<string, unknown>;

function isSchemaObject(value: unknown): value is SchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Produces valid JSON Schema for MCP clients while preserving existing tool
 * declarations. Earlier tool definitions placed `required` under `properties`.
 */
export function normalizeToolInputSchema(inputSchema: InputSchema): InputSchema {
  if (!isSchemaObject(inputSchema) || !isSchemaObject(inputSchema.properties)) {
    return inputSchema;
  }

  const { properties, ...schema } = inputSchema;
  const { required: legacyRequired, ...validProperties } = properties;

  return {
    ...schema,
    properties: validProperties,
    ...(isStringArray(legacyRequired) ? { required: legacyRequired } : {}),
    additionalProperties: false,
  } as InputSchema;
}

export function normalizeTool(tool: Tool): Tool {
  return {
    ...tool,
    inputSchema: normalizeToolInputSchema(tool.inputSchema),
  };
}
