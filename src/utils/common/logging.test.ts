import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from './logging.js';

afterEach(() => {
  delete process.env.LOG_LEVEL;
  vi.restoreAllMocks();
});

describe('structured logging', () => {
  it('writes JSON logs to stderr according to the configured level', () => {
    process.env.LOG_LEVEL = 'warn';
    const write = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    log.info('not emitted');
    log.warn('request rejected', { requestId: 'request-1' });

    expect(write).toHaveBeenCalledOnce();
    expect(JSON.parse(String(write.mock.calls[0][0]))).toMatchObject({
      level: 'warn',
      message: 'request rejected',
      meta: { requestId: 'request-1' },
    });
  });
});
