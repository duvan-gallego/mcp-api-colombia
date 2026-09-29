import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiRequestError, ApiRequestTimeoutError } from '../client/api-client.js';
import { ToolError } from './common/api-errors.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  handleToolError,
  validateToolInput,
} from './utils.js';

describe('tool utilities', () => {
  it('serializes data into MCP text content', () => {
    expect(createToolResponse({ name: 'Colombia' })).toEqual({
      content: [{ type: 'text', text: '{"name":"Colombia"}' }],
      isError: false,
      _meta: {},
    });
  });

  it('validates and returns typed tool input', () => {
    const schema = z.object({ id: z.number().int().positive() });

    expect(validateToolInput(schema, { id: 1 }, 'Get city by ID')).toEqual({ id: 1 });
  });

  it('converts invalid tool input into a ToolError', () => {
    expect(() =>
      validateToolInput(z.object({ id: z.number() }), { id: '1' }, 'Get city by ID')
    ).toThrow(
      expect.objectContaining({
        name: 'ToolError',
        code: 'TOOL_ERROR',
        message: 'Invalid input: Input validation for Get city by ID',
      })
    );
  });

  it('returns API data and maps API failures to ToolError', async () => {
    await expect(executeApiCall(async () => ({ id: 1 }), 'Get city')).resolves.toEqual({ id: 1 });
    await expect(
      executeApiCall(async () => Promise.reject(new Error('unavailable')), 'Get city')
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'ToolError',
        code: 'TOOL_ERROR',
        message: 'Get city failed. Please try again.',
      })
    );
  });

  it('maps API failures to safe user-facing messages', () => {
    expect(() => {
      throw new ApiRequestTimeoutError(1000);
    }).toThrow(ApiRequestTimeoutError);

    expect(() => handleToolError(new ApiRequestTimeoutError(1000), 'Get city')).toThrow(
      'API Colombia did not respond in time. Please try again.'
    );
    expect(() => handleToolError(new ApiRequestError('status 503', 503), 'Get city')).toThrow(
      'API Colombia is temporarily unavailable. Please try again.'
    );
  });

  it('extracts supplied arguments and defaults to an empty object', () => {
    expect(extractArguments({ params: { arguments: { id: 1 } } } as never)).toEqual({ id: 1 });
    expect(extractArguments({ params: {} } as never)).toEqual({});
  });

  it('preserves API error details', () => {
    const error = new ToolError('Request failed', { status: 503 });

    expect(error.toString()).toBe('[TOOL_ERROR] Request failed');
    expect(error.details).toEqual({ status: 503 });
  });
});
