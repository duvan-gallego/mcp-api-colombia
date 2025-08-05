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
  getApiV1President,
  getApiV1PresidentById,
  getApiV1PresidentNameByName,
  getApiV1PresidentPagedList,
  getApiV1PresidentSearchByKeyword,
  getApiV1PresidentYearByYear,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_PRESIDENTS: Tool = {
  name: 'get-presidents',
  description:
    'Get the list of presidents in Colombia, including general info like political party, city, start period, etc',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_PRESIDENT_BY_ID: Tool = {
  name: 'get-president-by-id',
  description: 'Get a specific president information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the president to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_PRESIDENT_BY_NAME: Tool = {
  name: 'get-president-by-name',
  description: 'Get a specific president information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the president to retrieve.',
      },
      required: ['name'],
    },
  },
};

const GET_PRESIDENT_BY_YEAR: Tool = {
  name: 'get-president-by-year',
  description: 'Get the president or presidents in the provided year',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'number',
        description: 'The year of the president to retrieve.',
      },
      required: ['year'],
    },
  },
};

const SEARCH_PRESIDENT_BY_KEYWORD: Tool = {
  name: 'search-president-by-keyword',
  description:
    'Search for presidents by a keyword in their name, last name, description or political party.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in president name, last name, description or political party.',
      },
      required: ['keyword'],
    },
  },
};

const GET_PRESIDENT_PAGINATED: Tool = {
  name: 'get-president-paginated',
  description:
    'Get a paginated list of presidents in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const PRESIDENT_TOOLS = [
  GET_PRESIDENTS,
  GET_PRESIDENT_BY_ID,
  GET_PRESIDENT_BY_NAME,
  GET_PRESIDENT_BY_YEAR,
  SEARCH_PRESIDENT_BY_KEYWORD,
  GET_PRESIDENT_PAGINATED,
];

export const PRESIDENT_HANDLERS: ToolHandlers = {
  'get-presidents': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get presidents with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const president = await executeApiCall(
      () => getApiV1President({ query: { sortBy, sortDirection } }),
      'Get presidents'
    );

    return createToolResponse(president);
  },
  'get-president-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get president by ID: ${id}`);

    const president = await executeApiCall(
      () => getApiV1PresidentById({ path: { id } }),
      `Get president by ID: ${id}`
    );

    return createToolResponse(president);
  },
  'get-president-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(z.object({ name: z.string() }), { name }, `Get president by name: ${name}`);

    const president = await executeApiCall(
      () => getApiV1PresidentNameByName({ path: { name } }),
      `Get president by name: ${name}`
    );

    return createToolResponse(president);
  },
  'get-president-by-year': async (request) => {
    const { year } = extractArguments<{ year: number }>(request);

    // Validate input
    validateToolInput(
      z.object({ year: z.number().int().min(1900).max(new Date().getFullYear()) }),
      { year },
      `Get president by year: ${year}`
    );

    const president = await executeApiCall(
      () => getApiV1PresidentYearByYear({ path: { year } }),
      `Get president by year: ${year}`
    );

    return createToolResponse(president);
  },
  'search-president-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search president by keyword: ${keyword}`
    );

    const presidents = await executeApiCall(
      () => getApiV1PresidentSearchByKeyword({ path: { keyword } }),
      'Search president by keyword'
    );

    return createToolResponse(presidents);
  },
  'get-president-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated departments with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const presidents = await executeApiCall(
      () =>
        getApiV1PresidentPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated presidents'
    );

    return createToolResponse(presidents);
  },
};
