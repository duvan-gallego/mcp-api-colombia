import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  PageWithSortOptions,
  SortOptions,
  SortOptionsWithRequiredId,
  ToolHandlers,
} from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1Department,
  getApiV1DepartmentById,
  getApiV1DepartmentByIdCities,
  getApiV1DepartmentNameByName,
  getApiV1DepartmentPagedList,
  getApiV1DepartmentSearchByKeyword,
  getApiV1TraditionalFairAndFestival,
  getApiV1TraditionalFairAndFestivalById,
  getApiV1TraditionalFairAndFestivalByIdCity,
  getApiV1TraditionalFairAndFestivalNameByName,
  getApiV1TraditionalFairAndFestivalPagedList,
  getApiV1TraditionalFairAndFestivalSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
  commonSortSchemaWithRequiredId,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_TRADITIONAL_FAIR_AND_FESTIVALS: Tool = {
  name: 'get-traditional-fairs-and-festivals',
  description:
    'Get the list of traditional fairs and festivals in Colombia, including general info like name, description and city',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_ID: Tool = {
  name: 'get-traditional-fair-and-festival-by-id',
  description: 'Get a specific traditional fair and festival information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the traditional fair and festival to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_ID_CITY: Tool = {
  name: 'get-traditional-fair-and-festival-by-id-city',
  description: 'Get a list of traditional fair and festival filtered by City Id.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the city to retrieve.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

const GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_NAME: Tool = {
  name: 'get-traditional-fair-and-festival-by-name',
  description: 'Get a specific traditional fair and festival information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the traditional fair and festival to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_TRADITIONAL_FAIR_AND_FESTIVAL_BY_KEYWORD: Tool = {
  name: 'search-traditional-fair-and-festival-by-keyword',
  description:
    'Search for traditional fairs and festivals by a keyword in their name or description.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in traditional fair and festival names or descriptions.',
      },
      required: ['keyword'],
    },
  },
};

const GET_TRADITIONAL_FAIR_AND_FESTIVAL_PAGINATED: Tool = {
  name: 'get-traditional-fair-and-festival-paginated',
  description:
    'Get a paginated list of traditional fairs and festivals in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const TRADITIONAL_FAIR_AND_FESTIVAL_TOOLS = [
  GET_TRADITIONAL_FAIR_AND_FESTIVALS,
  GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_ID,
  GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_ID_CITY,
  GET_TRADITIONAL_FAIR_AND_FESTIVAL_BY_NAME,
  SEARCH_TRADITIONAL_FAIR_AND_FESTIVAL_BY_KEYWORD,
  GET_TRADITIONAL_FAIR_AND_FESTIVAL_PAGINATED,
];

export const TRADITIONAL_FAIR_AND_FESTIVAL_HANDLERS: ToolHandlers = {
  'get-traditional-fairs-and-festivals': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get traditional fairs and festivals with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () => getApiV1TraditionalFairAndFestival({ query: { sortBy, sortDirection } }),
      'Get traditional fairs and festivals'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
  'get-traditional-fair-and-festival-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(
      commonRequiredIdSchema,
      { id },
      `Get traditional fair and festival by ID: ${id}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () => getApiV1TraditionalFairAndFestivalById({ path: { id } }),
      'Get traditional fair and festival by ID'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
  'get-traditional-fair-and-festival-by-id-city': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get a list of traditional fairs and festivals filtered by city ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () =>
        getApiV1TraditionalFairAndFestivalByIdCity({
          path: { id },
          query: { sortBy, sortDirection },
        }),
      'Get traditional fair and festival by city ID'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
  'get-traditional-fair-and-festival-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get traditional fair and festival by name: ${name}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () => getApiV1TraditionalFairAndFestivalNameByName({ path: { name } }),
      'Get traditional fair and festival by name'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
  'search-traditional-fair-and-festival-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search traditional fair and festival by keyword: ${keyword}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () => getApiV1TraditionalFairAndFestivalSearchByKeyword({ path: { keyword } }),
      'Search traditional fair and festival by keyword'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
  'get-traditional-fair-and-festival-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated traditional fairs and festivals with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const traditionalFairAndFestival = await executeApiCall(
      () =>
        getApiV1TraditionalFairAndFestivalPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated traditional fairs and festivals'
    );

    return createToolResponse(traditionalFairAndFestival);
  },
};
