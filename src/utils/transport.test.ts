import { describe, expect, it } from 'vitest';
import { resolveTransport } from './transport.js';

describe('resolveTransport', () => {
  it('defaults to Streamable HTTP', () => {
    expect(resolveTransport(undefined, [])).toEqual({
      type: 'streamable-http',
      usesLegacyAlias: false,
    });
  });

  it('uses stdio when requested by the CLI', () => {
    expect(resolveTransport(undefined, ['node', 'dist/index.js', '--stdio'])).toEqual({
      type: 'stdio',
      usesLegacyAlias: false,
    });
  });

  it('prefers MCP_TRANSPORT over the CLI argument', () => {
    expect(resolveTransport('streamable-http', ['node', 'dist/index.js', '--stdio'])).toEqual({
      type: 'streamable-http',
      usesLegacyAlias: false,
    });
  });

  it('supports the legacy sse alias during migration', () => {
    expect(resolveTransport('sse', [])).toEqual({ type: 'streamable-http', usesLegacyAlias: true });
  });

  it('rejects unsupported transport values', () => {
    expect(() => resolveTransport('websocket', [])).toThrow(
      'Unsupported MCP_TRANSPORT value: websocket. Use "stdio" or "streamable-http".'
    );
  });
});
