import { sql } from "drizzle-orm";
import { PgSelectBase } from "drizzle-orm/pg-core";

export type PgQueryType = PgSelectBase<any, any, any, any>;

export const pagination = <T extends PgSelectBase<any, any, any, any>>(query: Omit<T, "where">, defaultPageSize: number, defaultPageNumber: number, totalCount: number) => {
  const pageSize = defaultPageSize;
  const pageNumber = defaultPageNumber;

  const offset = (pageNumber - 1) * pageSize;

  query.offset(offset).limit(pageSize);

  const currentPage = pageNumber;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Calculate the count of data after applying the limit
  const count = Math.min(pageSize, totalCount - offset);

  return {
    query,
    pagination: {
      count,
      totalCount: parseInt(totalCount.toString()),
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
}
