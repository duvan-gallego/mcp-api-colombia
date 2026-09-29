import { describe, expect, it } from 'vitest';
import { resolveTransport } from './transport.js';

describe('resolveTransport', () => {
  it('defaults to Streamable HTTP', () => {
    expect(resolveTransport(undefined, [])).toBe('streamable-http');
  });

  it('uses stdio when requested by the CLI', () => {
    expect(resolveTransport(undefined, ['node', 'dist/index.js', '--stdio'])).toBe('stdio');
  });

  it('prefers MCP_TRANSPORT over the CLI argument', () => {
    expect(resolveTransport('streamable-http', ['node', 'dist/index.js', '--stdio'])).toBe(
      'streamable-http'
    );
  });

  it('rejects unsupported transport values', () => {
    expect(() => resolveTransport('websocket', [])).toThrow(
      'Unsupported MCP_TRANSPORT value: websocket. Use "stdio" or "streamable-http".'
    );
  });

  it('rejects the removed sse transport', () => {
    expect(() => resolveTransport('sse', [])).toThrow(
      'Unsupported MCP_TRANSPORT value: sse. Use "stdio" or "streamable-http".'
    );
  });
});
