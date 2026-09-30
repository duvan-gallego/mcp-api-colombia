import { Tool } from '@modelcontextprotocol/server';
import { describe, expect, it } from 'vitest';
import { createInputSchema, getAllHandlers, getAllTools } from './create-server.js';

type InputSchema = {
  properties?: Record<string, { type?: string; enum?: string[] }>;
  required?: string[];
};

function createValidArguments(tool: Tool): Record<string, unknown> {
  const inputSchema = tool.inputSchema as InputSchema;
  return Object.fromEntries(
    Object.entries(inputSchema.properties ?? {}).map(([name, property]) => [
      name,
      property.enum?.[0] ?? (property.type === 'number' ? 1 : 'test'),
    ])
  );
}

describe('MCP tool contracts', () => {
  const tools = getAllTools();
  const handlers = getAllHandlers();

  it('registers a unique handler for every advertised tool', () => {
    const toolNames = tools.map((tool) => tool.name).sort();

    expect(new Set(toolNames)).toHaveLength(toolNames.length);
    expect(Object.keys(handlers).sort()).toEqual(toolNames);
    for (const handler of Object.values(handlers)) {
      expect(typeof handler).toBe('function');
    }
  });

  it.each(tools)('$name accepts valid input and rejects unknown fields', (tool) => {
    const inputSchema = tool.inputSchema as InputSchema;
    const schema = createInputSchema(tool);
    const validArguments = createValidArguments(tool);

    expect(schema.safeParse(validArguments).success).toBe(true);
    expect(schema.safeParse({ ...validArguments, unexpected: true }).success).toBe(false);

    for (const requiredProperty of inputSchema.required ?? []) {
      const argumentsWithoutRequiredProperty = { ...validArguments };
      delete argumentsWithoutRequiredProperty[requiredProperty];

      expect(schema.safeParse(argumentsWithoutRequiredProperty).success).toBe(false);
    }
  });
});
