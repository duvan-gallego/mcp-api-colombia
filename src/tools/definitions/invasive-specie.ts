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
  getApiV1InvasiveSpecie,
  getApiV1InvasiveSpecieById,
  getApiV1InvasiveSpecieNameByName,
  getApiV1InvasiveSpeciePagedList,
  getApiV1InvasiveSpecieSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_INVASIVE_SPECIES: Tool = {
  name: 'get-invasive-species',
  description: 'Get the list of invasive species in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_INVASIVE_SPECIE_BY_ID: Tool = {
  name: 'get-invasive-specie-by-id',
  description: 'Get a specific invasive specie information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_INVASIVE_SPECIE_BY_NAME: Tool = {
  name: 'get-invasive-specie-by-name',
  description: 'Get a specific invasive specie information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the invasive specie to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_INVASIVE_SPECIE_BY_KEYWORD: Tool = {
  name: 'search-invasive-specie-by-keyword',
  description: 'Search for invasive species by a keyword in their name, common name or manage.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in invasive species name, common name or manage',
      },
      required: ['keyword'],
    },
  },
};

const GET_INVASIVE_SPECIE_PAGINATED: Tool = {
  name: 'get-invasive-specie-paginated',
  description:
    'Get a paginated list of invasive species in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const INVASIVE_SPECIE_TOOLS = [
  GET_INVASIVE_SPECIES,
  GET_INVASIVE_SPECIE_BY_ID,
  GET_INVASIVE_SPECIE_BY_NAME,
  SEARCH_INVASIVE_SPECIE_BY_KEYWORD,
  GET_INVASIVE_SPECIE_PAGINATED,
];

export const INVASIVE_SPECIE_HANDLERS: ToolHandlers = {
  'get-invasive-species': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get invasive species with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const invasiveSpecies = await executeApiCall(
      () => getApiV1InvasiveSpecie({ query: { sortBy, sortDirection } }),
      'Get invasive species'
    );

    return createToolResponse(invasiveSpecies);
  },
  'get-invasive-specie-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get invasive specie by ID: ${id}`);

    const invasiveSpecie = await executeApiCall(
      () => getApiV1InvasiveSpecieById({ path: { id } }),
      'Get invasive specie by ID'
    );

    return createToolResponse(invasiveSpecie);
  },
  'get-invasive-specie-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get invasive specie by name: ${name}`
    );

    const invasiveSpecie = await executeApiCall(
      () => getApiV1InvasiveSpecieNameByName({ path: { name } }),
      'Get invasive specie by name'
    );

    return createToolResponse(invasiveSpecie);
  },
  'search-invasive-specie-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search invasive specie by keyword: ${keyword}`
    );

    const invasiveSpecies = await executeApiCall(
      () => getApiV1InvasiveSpecieSearchByKeyword({ path: { keyword } }),
      'Search invasive species by keyword'
    );

    return createToolResponse(invasiveSpecies);
  },
  'get-invasive-specie-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated invasive species with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const invasiveSpecies = await executeApiCall(
      () =>
        getApiV1InvasiveSpeciePagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated invasive species'
    );

    return createToolResponse(invasiveSpecies);
  },
};
