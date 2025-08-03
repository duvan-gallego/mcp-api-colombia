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
  getApiV1DepartmentByIdNaturalareas,
  getApiV1DepartmentByIdTouristicattractions,
  getApiV1DepartmentNameByName,
  getApiV1DepartmentPagedList,
  getApiV1DepartmentSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
  commonSortSchemaWithRequiredId,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_DEPARTMENTS: Tool = {
  name: 'get-departments',
  description: 'Get the list of departments in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_DEPARTMENT_BY_ID: Tool = {
  name: 'get-department-by-id',
  description: 'Get a specific department information by its ID.',
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

const GET_DEPARTMENT_BY_ID_CITIES: Tool = {
  name: 'get-department-by-id-cities',
  description: 'Get a list of cities filtered by department ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

const GET_DEPARTMENT_BY_ID_NATURAL_AREAS: Tool = {
  name: 'get-department-by-id-natural-areas',
  description: 'Get list of natural areas filtered by department ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

const GET_DEPARTMENT_BY_ID_TOURISTIC_ATTRACTIONS: Tool = {
  name: 'get-department-by-id-touristic-attractions',
  description: 'Get list of touristic attractions filtered by department ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the department to retrieve.',
      },
      ...sortProperties,
      required: ['id'],
    },
  },
};

const GET_DEPARTMENT_BY_NAME: Tool = {
  name: 'get-department-by-name',
  description: 'Get a specific department information by its name.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the department to retrieve.',
      },
      required: ['name'],
    },
  },
};

const SEARCH_DEPARTMENT_BY_KEYWORD: Tool = {
  name: 'search-department-by-keyword',
  description: 'Search for departments by a keyword in their name, description or phone prefix.',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description: 'The keyword to search for in department names, description or phone prefix.',
      },
      required: ['keyword'],
    },
  },
};

const GET_DEPARTMENT_PAGINATED: Tool = {
  name: 'get-department-paginated',
  description: 'Get a paginated list of departments in Colombia.',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

export const DEPARTMENT_TOOLS = [
  GET_DEPARTMENTS,
  GET_DEPARTMENT_BY_ID,
  GET_DEPARTMENT_BY_ID_CITIES,
  GET_DEPARTMENT_BY_ID_NATURAL_AREAS,
  GET_DEPARTMENT_BY_ID_TOURISTIC_ATTRACTIONS,
  GET_DEPARTMENT_BY_NAME,
  SEARCH_DEPARTMENT_BY_KEYWORD,
  GET_DEPARTMENT_PAGINATED,
];

export const DEPARTMENT_HANDLERS: ToolHandlers = {
  'get-departments': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get departments with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const department = await executeApiCall(
      () => getApiV1Department({ query: { sortBy, sortDirection } }),
      'Get departments'
    );

    return createToolResponse(department);
  },
  'get-department-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get department by ID: ${id}`);

    const department = await executeApiCall(
      () => getApiV1DepartmentById({ path: { id } }),
      'Get department by ID'
    );

    return createToolResponse(department);
  },
  'get-department-by-id-cities': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get a list of cities filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const department = await executeApiCall(
      () => getApiV1DepartmentByIdCities({ path: { id }, query: { sortBy, sortDirection } }),
      `Get a list of cities filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    return createToolResponse(department);
  },
  'get-department-by-id-natural-areas': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get a list of natural areas filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const department = await executeApiCall(
      () => getApiV1DepartmentByIdNaturalareas({ path: { id }, query: { sortBy, sortDirection } }),
      `Get a list of natural areas filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    return createToolResponse(department);
  },
  'get-department-by-id-touristic-attractions': async (request) => {
    const { id, sortBy, sortDirection } = extractArguments<SortOptionsWithRequiredId>(request);

    // Validate input
    validateToolInput(
      commonSortSchemaWithRequiredId,
      { id, sortBy, sortDirection },
      `Get a list of touristic attractions filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const department = await executeApiCall(
      () =>
        getApiV1DepartmentByIdTouristicattractions({
          path: { id },
          query: { sortBy, sortDirection },
        }),
      `Get a list of touristic attractions filtered by department ID: ${id} with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    return createToolResponse(department);
  },
  'get-department-by-name': async (request) => {
    const { name } = extractArguments<{ name: string }>(request);

    // Validate input
    validateToolInput(z.object({ name: z.string() }), { name }, `Get department by name: ${name}`);

    const department = await executeApiCall(
      () => getApiV1DepartmentNameByName({ path: { name } }),
      `Get department by name: ${name}`
    );

    return createToolResponse(department);
  },
  'search-department-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search department by keyword: ${keyword}`
    );

    const departments = await executeApiCall(
      () => getApiV1DepartmentSearchByKeyword({ path: { keyword } }),
      `Search department by keyword: ${keyword}`
    );

    return createToolResponse(departments);
  },
  'get-department-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated departments with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const departments = await executeApiCall(
      () =>
        getApiV1DepartmentPagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      `Get paginated departments with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    return createToolResponse(departments);
  },
};
