import { z } from 'zod';

export function listingSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    page: z.number().int(),
    perPage: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    data: z.array(item),
  });
}

export type Listing<Item> = { page: number; perPage: number; total: number; data: Item[] };

export type PaginationOptions<Filter, SortField extends string> = {
  page?: number;
  perPage?: number;
  filter?: Filter;
  sortField?: SortField;
  sortDirection?: 'asc' | 'desc';
};

export function toPaginationParams({
  filter,
  ...options
}: PaginationOptions<object, string>): Record<string, string | number | undefined> {
  return { ...options, filter: filter && JSON.stringify(filter) };
}
