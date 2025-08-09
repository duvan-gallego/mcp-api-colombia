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
  getApiV1IndigenousReservation,
  getApiV1IndigenousReservationById,
  getApiV1IndigenousReservationNameByName,
  getApiV1IndigenousReservationPagedList,
  getApiV1IndigenousReservationSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_INDIGENOUS_RESERVATIONS: Tool = {
  name: 'get-indigenous-reservations',
  description:
    'Get the list of indigenous reservations in Colombia, including general info like name, description, images, etc',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_INDIGENOUS_RESERVATION_BY_ID: Tool = {
  name: 'get-indigenous-reservation-by-id',
  description: 'Get a specific indigenous reservation information by its ID.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the indigenous reservation to retrieve.',
      },
      required: ['id'],
    },
  },
};

const GET_INDIGENOUS_RESERVATION_BY_NAME: Tool = {
  name: 'get-indigenous-reservation-by-name',
  description: 'Get a specific indigenous reservation information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the indigenous reservation to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_INDIGENOUS_RESERVATION_BY_KEYWORD: Tool = {
  name: 'search-indigenous-reservation-by-keyword',
  description:
    'Search for indigenous reservations by a keyword in their name, description or languages.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in indigenous reservation names, description or languages.',
      },
      required: ['keyword'],
    },
  },
};

const GET_INDIGENOUS_RESERVATION_PAGINATED: Tool = {
  name: 'get-indigenous-reservation-paginated',
  description:
    'Get a paginated list of indigenous reservations in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const INDIGENOUS_RESERVATION_TOOLS = [
  GET_INDIGENOUS_RESERVATIONS,
  GET_INDIGENOUS_RESERVATION_BY_ID,
  GET_INDIGENOUS_RESERVATION_BY_NAME,
  SEARCH_INDIGENOUS_RESERVATION_BY_KEYWORD,
  GET_INDIGENOUS_RESERVATION_PAGINATED,
];

export const INDIGENOUS_RESERVATION_HANDLERS: ToolHandlers = {
  'get-indigenous-reservations': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get indigenous reservations with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const indigenousReservations = await executeApiCall(
      () => getApiV1IndigenousReservation({ query: { sortBy, sortDirection } }),
      'Get indigenous reservations'
    );

    return createToolResponse(indigenousReservations);
  },
  'get-indigenous-reservation-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get indigenous reservation by ID: ${id}`);

    const indigenousReservation = await executeApiCall(
      () => getApiV1IndigenousReservationById({ path: { id } }),
      'Get indigenous reservation by ID'
    );

    return createToolResponse(indigenousReservation);
  },
  'get-indigenous-reservation-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ name: z.string() }),
      { name },
      `Get indigenous reservation by name: ${name}`
    );

    const indigenousReservation = await executeApiCall(
      () => getApiV1IndigenousReservationNameByName({ path: { name } }),
      'Get indigenous reservation by name'
    );

    return createToolResponse(indigenousReservation);
  },
  'search-indigenous-reservation-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search indigenous reservation by keyword: ${keyword}`
    );

    const indigenousReservations = await executeApiCall(
      () => getApiV1IndigenousReservationSearchByKeyword({ path: { keyword } }),
      'Search indigenous reservation by keyword'
    );

    return createToolResponse(indigenousReservations);
  },
  'get-indigenous-reservation-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated indigenous reservations with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const indigenousReservations = await executeApiCall(
      () =>
        getApiV1IndigenousReservationPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated indigenous reservations'
    );

    return createToolResponse(indigenousReservations);
  },
};
