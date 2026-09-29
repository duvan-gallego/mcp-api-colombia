import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiRequestError, ApiRequestTimeoutError, createResilientFetch } from './api-client.js';

afterEach(() => {
  delete process.env.API_TIMEOUT_MS;
  delete process.env.API_MAX_ATTEMPTS;
});

describe('resilient API fetch', () => {
  it('retries transient upstream failures before returning a successful response', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('{"name":"Colombia"}', { status: 200 }));

    const response = await createResilientFetch(fetchMock)(new Request('https://api-colombia.com'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-retryable upstream responses', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 400 }));

    await expect(
      createResilientFetch(fetchMock)(new Request('https://api-colombia.com'))
    ).rejects.toEqual(
      expect.objectContaining({ name: 'ApiRequestError', message: expect.any(String), status: 400 })
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('aborts requests that exceed the configured timeout', async () => {
    process.env.API_TIMEOUT_MS = '1';
    const fetchMock = vi.fn(
      (request: Request) =>
        new Promise((_resolve, reject) => {
          request.signal.addEventListener('abort', () => reject(new Error('aborted')));
        })
    );

    await expect(
      createResilientFetch(fetchMock as unknown as typeof fetch)(
        new Request('https://api-colombia.com')
      )
    ).rejects.toBeInstanceOf(ApiRequestTimeoutError);
  });
});
