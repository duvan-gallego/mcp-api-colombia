import z from 'zod';
import { Result, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export type ToolHandlers = Record<
  string,
  (request: z.infer<typeof CallToolRequestSchema>) => Promise<Result>
>;

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
