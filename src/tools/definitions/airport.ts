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
  getApiV1Airport,
  getApiV1AirportById,
  getApiV1AirportNameByName,
  getApiV1AirportPagedList,
  getApiV1AirportSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_AIRPORTS: Tool = {
  name: 'get-airports',
  description:
    'Get the list of airports in Colombia, including general info like name, description, images, etc',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_AIRPORT_BY_ID: Tool = {
  name: 'get-airport-by-id',
  description: 'Get a specific airport information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the airport to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_AIRPORT_BY_NAME: Tool = {
  name: 'get-airport-by-name',
  description: 'Get a specific airport information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the airport to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_AIRPORT_BY_KEYWORD: Tool = {
  name: 'search-airport-by-keyword',
  description: 'Search for airports by a keyword in their name, description or city.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in airport names, description or city.',
      },
      required: ['keyword'],
    },
  },
};

const GET_AIRPORT_PAGINATED: Tool = {
  name: 'get-airport-paginated',
  description:
    'Get a paginated list of airports in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const AIRPORT_TOOLS = [
  GET_AIRPORTS,
  GET_AIRPORT_BY_ID,
  GET_AIRPORT_BY_NAME,
  SEARCH_AIRPORT_BY_KEYWORD,
  GET_AIRPORT_PAGINATED,
];

export const AIRPORT_HANDLERS: ToolHandlers = {
  'get-airports': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get airports with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const airports = await executeApiCall(
      () => getApiV1Airport({ query: { sortBy, sortDirection } }),
      'Get airports'
    );

    return createToolResponse(airports);
  },
  'get-airport-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get airport by ID: ${id}`);

    const airport = await executeApiCall(
      () => getApiV1AirportById({ path: { id } }),
      'Get airport by ID'
    );

    return createToolResponse(airport);
  },
  'get-airport-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(z.object({ name: z.string() }), { name }, `Get airport by name: ${name}`);

    const airport = await executeApiCall(
      () => getApiV1AirportNameByName({ path: { name } }),
      'Get airport by name'
    );

    return createToolResponse(airport);
  },
  'search-airport-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search airport by keyword: ${keyword}`
    );

    const airports = await executeApiCall(
      () => getApiV1AirportSearchByKeyword({ path: { keyword } }),
      'Search airport by keyword'
    );

    return createToolResponse(airports);
  },
  'get-airport-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated airports with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const airports = await executeApiCall(
      () =>
        getApiV1AirportPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated airports'
    );

    return createToolResponse(airports);
  },
};
