import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from '../../utils/types.js';
import {
  createToolResponse,
  executeApiCall,
  extractArguments,
  validateToolInput,
} from '../../utils/utils.js';
import {
  getApiV1HolidayYearByYear,
  getApiV1HolidayYearByYearMonthByMonth,
} from '../../client/generated/index.js';

const GET_HOLIDAY_BY_YEAR: Tool = {
  name: 'get-holiday-by-year',
  description: 'Get the list of holidays per year in Colombia',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'number',
        description: 'The year of the holiday to retrieve.',
      },
      required: ['year'],
    },
  },
};

const GET_HOLIDAY_BY_YEAR_AND_MONTH: Tool = {
  name: 'get-holiday-by-year-and-month',
  description: 'Get the list of holidays per year and month in Colombia',
  inputSchema: {
    type: 'object',
    properties: {
      year: {
        type: 'number',
        description: 'The year of the holiday to retrieve.',
      },
      month: {
        type: 'number',
        description: 'The month of the holiday to retrieve.',
      },
      required: ['year', 'month'],
    },
  },
};

export const HOLIDAY_TOOLS = [GET_HOLIDAY_BY_YEAR, GET_HOLIDAY_BY_YEAR_AND_MONTH];

export const HOLIDAY_HANDLERS: ToolHandlers = {
  'get-holiday-by-year': async (request) => {
    const { year } = extractArguments<{ year: number }>(request);

    // Validate input
    validateToolInput(
      z.object({ year: z.number().int().min(1819).max(new Date().getFullYear()) }),
      { year },
      `Get holiday by year: ${year}`
    );

    const holiday = await executeApiCall(
      () => getApiV1HolidayYearByYear({ path: { year } }),
      `Get holiday by year: ${year}`
    );

    return createToolResponse(holiday);
  },
  'get-holiday-by-year-and-month': async (request) => {
    const { year, month } = extractArguments<{ year: number; month: number }>(request);

    // Validate input
    validateToolInput(
      z.object({
        year: z.number().int().min(1819).max(new Date().getFullYear()),
        month: z.number().int().min(1).max(12),
      }),
      { year, month },
      `Get holiday by year and month: ${year}-${month}`
    );

    const holiday = await executeApiCall(
      () => getApiV1HolidayYearByYearMonthByMonth({ path: { year, month } }),
      `Get holiday by year and month: ${year}-${month}`
    );

    return createToolResponse(holiday);
  },
};
