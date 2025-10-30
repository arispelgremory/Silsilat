import { PgTransaction } from "drizzle-orm/pg-core";
import { GoldPriceFilter, GoldPrice, GoldPriceInsertType } from "./gold-price.model";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { and, ExtractTablesWithRelations, eq, sql, gte, lte } from "drizzle-orm";
import { pagination, PgQueryType } from "@/util/pagination";
import { db } from "@/db";

/**
 * Create a new gold price record
 * @param goldPriceData - Gold price data to insert
 * @param tx - Optional transaction
 * @returns Promise resolving to created gold price record
 */
export const createGoldPrice = async (
    goldPriceData: GoldPriceInsertType, 
    tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>
) => {
    if (!goldPriceData) {
        throw new Error('Gold price data is required!');
    }

    if (tx) {
        return await tx.insert(GoldPrice).values(goldPriceData).returning();
    }

    return await db.insert(GoldPrice).values(goldPriceData).returning();
};

/**
 * Get gold prices with filtering and pagination
 * @param filters - Filter criteria
 * @returns Promise resolving to paginated gold price records
 */
export const getGoldPrices = async (filters: GoldPriceFilter) => {
    const whereClause = [];

    if (filters.startDate) {
        whereClause.push(gte(GoldPrice.date, new Date(filters.startDate)));
    }

    if (filters.endDate) {
        whereClause.push(lte(GoldPrice.date, new Date(filters.endDate)));
    }


    if (filters.source) {
        whereClause.push(eq(GoldPrice.source, filters.source));
    }

    const baseQuery = db.select().from(GoldPrice).where(and(...whereClause));
    const pageSize = parseInt(filters.page_size?.toString() || '10');
    const pageNumber = parseInt(filters.page_number?.toString() || '1');

    // Get total count using a separate count query
    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(GoldPrice).where(and(...whereClause));
    const totalCount = totalCountResult[0].count;

    // Apply pagination utility
    const paginatedQuery = pagination(baseQuery as unknown as PgQueryType, pageSize, pageNumber, totalCount);

    // Apply sorting
    if (filters.sort_by) {
        baseQuery.orderBy(sql`${sql.identifier(filters.sort_by)} ${sql.raw(filters.sort_order || 'DESC')}`);
    } else {
        baseQuery.orderBy(sql`${GoldPrice.date} DESC`);
    }

    // Execute the paginated query
    const paginatedData = await paginatedQuery.query;

    return {
        pagination: paginatedQuery.pagination,
        data: paginatedData
    };
};

/**
 * Get gold price by ID
 * @param id - Gold price ID
 * @returns Promise resolving to gold price record
 */
export const getGoldPriceById = async (id: string) => {
    if (!id) {
        throw new Error('Gold price ID is required');
    }
    return await db.select().from(GoldPrice).where(eq(GoldPrice.id, id)).limit(1);
};

/**
 * Get latest gold price
 * @returns Promise resolving to latest gold price record
 */
export const getLatestGoldPrice = async () => {
    return await db.select()
        .from(GoldPrice)
        .orderBy(sql`${GoldPrice.date} DESC`)
        .limit(1);
};

/**
 * Get yesterday's gold price
 * @returns Promise resolving to yesterday's gold price record
 */
export const getYesterdayGoldPrice = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Start of yesterday
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return await db.select()
        .from(GoldPrice)
        .where(and(
            gte(GoldPrice.date, yesterday),
            lte(GoldPrice.date, today)
        ))
        .orderBy(sql`${GoldPrice.date} DESC`)
        .limit(1);
};

/**
 * Update gold price by ID
 * @param id - Gold price ID
 * @param goldPriceData - Updated gold price data
 * @param tx - Optional transaction
 * @returns Promise resolving to updated gold price record
 */
export const updateGoldPrice = async (
    id: string, 
    goldPriceData: Partial<GoldPriceInsertType>, 
    tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>
) => {
    if (!id || !goldPriceData) {
        throw new Error('Gold price ID and data are required');
    }

    const updateData = {
        ...goldPriceData,
        updatedAt: new Date()
    };

    if (tx) {
        return await tx.update(GoldPrice).set(updateData).where(eq(GoldPrice.id, id)).returning();
    }
    return await db.update(GoldPrice).set(updateData).where(eq(GoldPrice.id, id)).returning();
};

/**
 * Delete gold price by ID
 * @param id - Gold price ID
 * @param tx - Optional transaction
 * @returns Promise resolving to deleted gold price record
 */
export const deleteGoldPrice = async (
    id: string, 
    tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>
) => {
    if (!id) {
        throw new Error('Gold price ID is required');
    }

    if (tx) {
        return await tx.delete(GoldPrice).where(eq(GoldPrice.id, id)).returning();
    }
    return await db.delete(GoldPrice).where(eq(GoldPrice.id, id)).returning();
};

/**
 * Check if gold price exists for a specific date
 * @param date - Date to check
 * @returns Promise resolving to boolean
 */
export const goldPriceExistsForDate = async (date: Date) => {
    const result = await db.select()
        .from(GoldPrice)
        .where(eq(GoldPrice.date, date))
        .limit(1);
    
    return result.length > 0;
};
