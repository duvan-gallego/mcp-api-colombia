import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PageWithSortOptions, SortOptions, ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1Radio,
  getApiV1RadioById,
  getApiV1RadioNameByName,
  getApiV1RadioPagedList,
  getApiV1RadioSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_RADIOS: Tool = {
  name: 'get-radios',
  description:
    'Get the list of radios in Colombia, including general info like name, url, frequency, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_RADIO_BY_ID: Tool = {
  name: 'get-radio-by-id',
  description: 'Get a specific radio information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the radio to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_RADIO_BY_NAME: Tool = {
  name: 'get-radio-by-name',
  description: 'Get a specific radio information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the radio to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_RADIO_BY_KEYWORD: Tool = {
  name: 'search-radio-by-keyword',
  description: 'Search for radios by a keyword in their name, frequency, URL or streaming.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in radio name, frequency, URL or streaming.',
      },
      required: ['keyword'],
    },
  },
};

const GET_RADIO_PAGINATED: Tool = {
  name: 'get-radio-paginated',
  description:
    'Get a paginated list of radios in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const RADIO_TOOLS = [
  GET_RADIOS,
  GET_RADIO_BY_ID,
  GET_RADIO_BY_NAME,
  SEARCH_RADIO_BY_KEYWORD,
  GET_RADIO_PAGINATED,
];

export const RADIO_HANDLERS: ToolHandlers = {
  'get-radios': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get radios with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const radios = await executeApiCall(
      () => getApiV1Radio({ query: { sortBy, sortDirection } }),
      'Get radios'
    );

    return createToolResponse(radios);
  },
  'get-radio-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get radio by ID: ${id}`);

    const radio = await executeApiCall(
      () => getApiV1RadioById({ path: { id } }),
      'Get radio by ID'
    );

    return createToolResponse(radio);
  },
  'get-radio-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(z.object({ name: z.string() }), { name }, `Get radio by name: ${name}`);

    const radio = await executeApiCall(
      () => getApiV1RadioNameByName({ path: { name } }),
      'Get radio by name'
    );

    return createToolResponse(radio);
  },
  'search-radio-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search radio by keyword: ${keyword}`
    );

    const radios = await executeApiCall(
      () => getApiV1RadioSearchByKeyword({ path: { keyword } }),
      'Search radio by keyword'
    );

    return createToolResponse(radios);
  },
  'get-radio-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated radios with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const radios = await executeApiCall(
      () =>
        getApiV1RadioPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated radios'
    );

    return createToolResponse(radios);
  },
};
