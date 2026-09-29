import { describe, expect, it, vi } from 'vitest';

vi.mock('../../client/generated/index.js', () => ({
  getApiV1CountryColombia: vi.fn(),
}));

import { getApiV1CountryColombia } from '../../client/generated/index.js';
import { COUNTRY_HANDLERS } from './country.js';

describe('country tools', () => {
  it('returns the API response as MCP text content', async () => {
    const country = { name: 'Colombia', capital: 'Bogotá' };
    vi.mocked(getApiV1CountryColombia).mockResolvedValueOnce(country as never);

    await expect(COUNTRY_HANDLERS['get-country-colombia']({} as never)).resolves.toEqual({
      content: [{ type: 'text', text: JSON.stringify(country) }],
      isError: false,
      _meta: {},
    });
    expect(getApiV1CountryColombia).toHaveBeenCalledOnce();
  });

  it('returns a ToolError when the API request fails', async () => {
    vi.mocked(getApiV1CountryColombia).mockRejectedValueOnce(new Error('upstream unavailable'));

    await expect(COUNTRY_HANDLERS['get-country-colombia']({} as never)).rejects.toMatchObject({
      name: 'ToolError',
      code: 'TOOL_ERROR',
      message: 'Get country colombia data failed. Please try again.',
    });
  });
});
