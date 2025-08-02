import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from '../../utils/types.js';
import { createToolResponse, executeApiCall } from '../../utils/utils.js';
import { getApiV1CountryColombia } from '../../client/generated/index.js';

// Tool definitions
const GET_COUNTRY_COLOMBIA: Tool = {
  name: 'get-country-colombia',
  description: 'Get The information about Colombia like TimeZone, Languages, Currency, etc.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const COUNTRY_TOOLS = [GET_COUNTRY_COLOMBIA];

export const COUNTRY_HANDLERS: ToolHandlers = {
  'get-country-colombia': async () => {
    const country = await executeApiCall(
      () => getApiV1CountryColombia(),
      'Get country colombia data'
    );

    return createToolResponse(country);
  },
};
