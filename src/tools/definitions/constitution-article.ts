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
  getApiV1ConstitutionArticle,
  getApiV1ConstitutionArticleByChapterNumberByChapternumber,
  getApiV1ConstitutionArticleById,
  getApiV1ConstitutionArticlePagedList,
  getApiV1ConstitutionArticleSearchByKeyword,
} from '../../client/generated/index.js';
import {
  commonPageSchemaWithSort,
  commonRequiredIdSchema,
  commonSortSchema,
} from '../../utils/common/schemas.js';
import { pageProperties, sortProperties } from '../../utils/common/tools-properties.js';

// Tool definitions
const GET_CONSTITUTION_ARTICLES: Tool = {
  name: 'get-constitution-articles',
  description:
    'Get the list of Constitution Articles in Colombia, including general info like title, chapter number, content,',
  inputSchema: {
    type: 'object',
    properties: {
      ...sortProperties,
      required: [],
    },
  },
};

const GET_CONSTITUTION_ARTICLE_BY_ID: Tool = {
  name: 'get-constitution-article-by-id',
  description: 'Get a specific Constitution Article information by its ID.',
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

const SEARCH_CONSTITUTION_ARTICLE_BY_KEYWORD: Tool = {
  name: 'search-constitution-article-by-keyword',
  description:
    'Search for Constitution Articles by a keyword in their title, chapter number or content',
  inputSchema: {
    type: 'object',
    properties: {
      keyword: {
        type: 'string',
        description:
          'The keyword to search for in Constitution Articles title, chapter number or content.',
      },
      required: ['keyword'],
    },
  },
};

const GET_CONSTITUTION_ARTICLE_PAGINATED: Tool = {
  name: 'get-constitution-article-paginated',
  description:
    'Get a paginated list of Constitution Articles in Colombia, using pagination including page, pageSize, total records and data',
  inputSchema: {
    type: 'object',
    properties: {
      ...pageProperties,
      ...sortProperties,
      required: ['page', 'pageSize'],
    },
  },
};

const GET_CONSTITUTION_ARTICLE_BY_CHAPTER_NUMBER: Tool = {
  name: 'get-constitution-article-by-chapter-number',
  description: 'Get a specific Constitution Article information by its chapter number.',
  inputSchema: {
    type: 'object',
    properties: {
      chapterNumber: {
        type: 'number',
        description: 'The chapter number of the Constitution Article to retrieve.',
      },
      required: ['chapterNumber'],
    },
  },
};

export const CONSTITUTION_ARTICLE_TOOLS = [
  GET_CONSTITUTION_ARTICLES,
  GET_CONSTITUTION_ARTICLE_BY_ID,
  SEARCH_CONSTITUTION_ARTICLE_BY_KEYWORD,
  GET_CONSTITUTION_ARTICLE_PAGINATED,
  GET_CONSTITUTION_ARTICLE_BY_CHAPTER_NUMBER,
];

export const CONSTITUTION_ARTICLE_HANDLERS: ToolHandlers = {
  'get-constitution-articles': async (request) => {
    const { sortBy, sortDirection } = extractArguments<SortOptions>(request);

    // Validate input
    validateToolInput(
      commonSortSchema,
      { sortBy, sortDirection },
      `Get Constitution Articles with sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const constitutionArticles = await executeApiCall(
      () => getApiV1ConstitutionArticle({ query: { sortBy, sortDirection } }),
      'Get Constitution Articles'
    );

    return createToolResponse(constitutionArticles);
  },
  'get-constitution-article-by-id': async (request) => {
    const { id } = extractArguments<{ id: number }>(request);

    // Validate input
    validateToolInput(commonRequiredIdSchema, { id }, `Get constitution article by ID: ${id}`);

    const constitutionArticle = await executeApiCall(
      () => getApiV1ConstitutionArticleById({ path: { id } }),
      'Get constitution article by ID'
    );

    return createToolResponse(constitutionArticle);
  },
  'search-constitution-article-by-keyword': async (request) => {
    const { keyword } = extractArguments<{ keyword: string }>(request);

    // Validate input
    validateToolInput(
      z.object({ keyword: z.string() }),
      { keyword },
      `Search constitution article by keyword: ${keyword}`
    );

    const constitutionArticles = await executeApiCall(
      () => getApiV1ConstitutionArticleSearchByKeyword({ path: { keyword } }),
      'Search constitution article by keyword'
    );

    return createToolResponse(constitutionArticles);
  },
  'get-constitution-article-paginated': async (request) => {
    const { page, pageSize, sortBy, sortDirection } =
      extractArguments<PageWithSortOptions>(request);

    // Validate input
    validateToolInput(
      commonPageSchemaWithSort,
      { page, pageSize, sortBy, sortDirection },
      `Get paginated constitution articles with page: ${page}, pageSize: ${pageSize}, sortBy: ${sortBy}, sortDirection: ${sortDirection}`
    );

    const constitutionArticles = await executeApiCall(
      () =>
        getApiV1ConstitutionArticlePagedList({
          query: { Page: page, PageSize: pageSize, SortBy: sortBy, SortDirection: sortDirection },
        }),
      'Get paginated constitution articles'
    );

    return createToolResponse(constitutionArticles);
  },
  'get-constitution-article-by-chapter-number': async (request) => {
    const { chapterNumber } = extractArguments<{ chapterNumber: number }>(request);

    // Validate input
    validateToolInput(
      commonRequiredIdSchema,
      { chapterNumber },
      `Get constitution article by chapter number: ${chapterNumber}`
    );

    const constitutionArticle = await executeApiCall(
      () =>
        getApiV1ConstitutionArticleByChapterNumberByChapternumber({
          path: { chapternumber: chapterNumber },
        }),
      'Get constitution article by chapter number'
    );

    return createToolResponse(constitutionArticle);
  },
};
