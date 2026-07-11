import { z, type ZodTypeAny } from "zod";

export const paginationMetaSchema = z.object({
  current_page: z.number(),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function paginatedSchema<T extends ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema,
  });
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export const PAGE_SIZE = 50;

export function buildPageQuery(page: number, perPage: number = PAGE_SIZE): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  return `?${params.toString()}`;
}

export function hasMore(meta: PaginationMeta): boolean {
  return meta.current_page < meta.last_page;
}
