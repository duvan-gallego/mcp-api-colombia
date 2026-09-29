import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../client/generated/index.js', () => ({
  getApiV1City: vi.fn(),
  getApiV1CityById: vi.fn(),
  getApiV1CityNameByName: vi.fn(),
  getApiV1CityPagedList: vi.fn(),
  getApiV1CitySearchByKeyword: vi.fn(),
}));

import { getApiV1CityById } from '../../client/generated/index.js';
import { CITY_HANDLERS } from './city.js';

describe('city tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the ID and forwards it to the generated API client', async () => {
    const city = { id: 1, name: 'Bogotá' };
    vi.mocked(getApiV1CityById).mockResolvedValueOnce(city as never);

    await expect(
      CITY_HANDLERS['get-city-by-id']({ params: { arguments: { id: 1 } } } as never)
    ).resolves.toMatchObject({
      content: [{ type: 'text', text: JSON.stringify(city) }],
    });
    expect(getApiV1CityById).toHaveBeenCalledWith({ path: { id: 1 } });
  });

  it('rejects a missing ID before calling the generated API client', async () => {
    await expect(
      CITY_HANDLERS['get-city-by-id']({ params: { arguments: {} } } as never)
    ).rejects.toMatchObject({
      name: 'ToolError',
      code: 'TOOL_ERROR',
      message: 'Invalid input: Input validation for Get city by ID: undefined',
    });
    expect(getApiV1CityById).not.toHaveBeenCalled();
  });
});
