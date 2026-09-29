import { CallToolResult } from '@modelcontextprotocol/server';
import { ToolRequest } from './common/schemas.js';

export type ToolHandlers = Record<string, (request: ToolRequest) => Promise<CallToolResult>>;

export type SortOptions = {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
};

export type SortOptionsWithRequiredId = SortOptions & {
  id: number;
};

export type PageWithSortOptions = SortOptions & {
  page: number;
  pageSize: number;
};
