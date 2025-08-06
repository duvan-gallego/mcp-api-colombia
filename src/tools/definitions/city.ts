import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PageWithSortOptions, SortOptions, ToolHandlers } from '../../utils/types.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import {
  getApiV1City,
  getApiV1CityById,
  getApiV1CityNameByName,
  getApiV1CityPagedList,
  getApiV1CitySearchByKeyword,
} from '../../client/generated/index.js';

// Tool definitions
const GET_CITIES: Tool = {
  name: 'get-cities',
  description:
    'Get the list of cities in Colombia including general info like description, department, Surface city, etc',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_CITY_BY_ID: Tool = {
  name: 'get-city-by-id',
  description: 'Get a specific city information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the city to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_CITY_BY_NAME: Tool = {
  name: 'get-city-by-name',
  description: 'Get a specific city information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the city to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_CITY_BY_KEYWORD: Tool = {
  name: 'search-city-by-keyword',
  description: 'Search for cities by a keyword in their name, description or PostalCode.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in city names, description or PostalCode.',
      },
      required: ['keyword'],
    },
  },
};

const GET_CITY_PAGINATED: Tool = {
  name: 'get-city-paginated',
  description:
    'Get a paginated list of cities in Colombia, including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const CITY_TOOLS = [
  GET_CITIES,
  GET_CITY_BY_ID,
  GET_CITY_BY_NAME,
  SEARCH_CITY_BY_KEYWORD,
  GET_CITY_PAGINATED,
];

export const CITY_HANDLERS: ToolHandlers = {
  'get-cities': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get cities with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const city = await executeApiCall(
      () => getApiV1City({ query: { sortBy, sortDirection } }),
      'Get cities'
    );

    return createToolResponse(city);
  },
  'get-city-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get city by ID: ${id}`);

    const city = await executeApiCall(() => getApiV1CityById({ path: { id } }), 'Get city by ID');

    return createToolResponse(city);
  },
  'get-city-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(z.object({ name: z.string() }), { name }, `Get city by name: ${name}`);

    const city = await executeApiCall(
      () => getApiV1CityNameByName({ path: { name } }),
      'Get city by name'
    );

    return createToolResponse(city);
  },
  'search-city-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search city by keyword: ${keyword}`
    );

    const city = await executeApiCall(
      () => getApiV1CitySearchByKeyword({ path: { keyword } }),
      'Search city by keyword'
    );

    return createToolResponse(city);
  },
  'get-city-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated cities with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const cities = await executeApiCall(
      () =>
        getApiV1CityPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated cities'
    );

    return createToolResponse(cities);
  },
};
