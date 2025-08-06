export const sortProperties = {
  sortBy: {
    type: 'string',
    description:
      'It can be sorted by any of the fields that have numerical, string, or date values (for example: Id, name, description, etc.).',
  },
  sortDirection: {
    type: 'string',
    description: 'Direction to sort the regions. Options: "asc", "desc"',
    enum: ['asc', 'desc'],
  },
};

export const pageProperties = {
  page: {
    type: 'number',
    description: 'The page number to retrieve.',
  },
  pageSize: {
    type: 'number',
    description: 'The number of items per page.',
  },
};
