import { describe, expect, it } from 'vitest';
import { getAllTools } from '../../create-server.js';

describe('tool input schemas', () => {
  it('exposes valid required fields and rejects undeclared arguments', () => {
    for (const tool of getAllTools()) {
      const schema = tool.inputSchema as {
        properties?: Record<string, unknown>;
        required?: unknown;
        additionalProperties?: unknown;
      };

      expect(schema.additionalProperties, tool.name).toBe(false);
      expect(schema.properties?.required, tool.name).toBeUndefined();
      expect(schema.required, tool.name).toSatisfy(
        (required) =>
          required === undefined ||
          (Array.isArray(required) && required.every((key) => typeof key === 'string'))
      );
    }
  });

  it('keeps required arguments at the schema root', () => {
    const cityById = getAllTools().find((tool) => tool.name === 'get-city-by-id');

    expect(cityById?.inputSchema).toMatchObject({
      required: ['id'],
      properties: { id: { type: 'number' } },
      additionalProperties: false,
    });
  });
});
