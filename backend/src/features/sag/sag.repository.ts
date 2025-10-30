import { PgTransaction } from "drizzle-orm/pg-core";
import { SagFilter, SagModel, SagModelInsertType, SagOverrideFailureSchema } from "./sag.model";
import { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { and, ExtractTablesWithRelations, eq, sql } from "drizzle-orm";
import { pagination, PgQueryType } from "@/util/pagination";
import { db } from "@/db";

export const createSag = async (sagData: SagModelInsertType, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {

    if (!sagData) {
        throw new Error('Surat Aduan Gadayan data is required!');
    }

    // Just an example, modify the SAG Data later.
    if (tx) {
        return await tx.insert(SagModel).values(sagData).returning();
    }

    return await db.insert(SagModel).values(sagData).returning();

}

/**
 * Get SAG by ID or all SAGs with pagination
 * 
 * @param id - Optional UUID of the SAG to retrieve
 * @param page_size - Number of records per page (for pagination)
 * @param page_number - Page number (0-based index for pagination)
 * @returns Promise resolving to SAG record(s) or paginated list
 */

export const getSag = async (
    filters: SagFilter
) => {
    const whereClause = [];
    console.log(filters);

    if (filters.id) {
        whereClause.push(eq(SagModel.sagId, filters.id));
    }

    if (filters.status) {
        whereClause.push(eq(SagModel.status, filters.status));
    }

    if (filters.certNo) {
        whereClause.push(eq(SagModel.certNo, filters.certNo));
    }

    if (filters.tokenId) {
        whereClause.push(eq(SagModel.tokenId, filters.tokenId));
    }

    if ('ltv' in filters){
        whereClause.push(sql`(${SagModel.sagProperties}->>'ltv')::float >= 0.8`);
    }
    
    if ('risk_level' in filters){
        whereClause.push(sql`(${SagModel.sagProperties}->>'risk_level')::text IN ('HIGH', 'VERY_HIGH')`);
    }

    const baseQuery = db.select().from(SagModel).where(and(...whereClause));
    const pageSize = parseInt(filters.page_size?.toString() || '10');
    const pageNumber = parseInt(filters.page_number?.toString() || '1');

    // Get total count using a separate count query
    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(SagModel).where(and(...whereClause));
    const totalCount = totalCountResult[0].count;
    
    // Apply pagination utility
    const paginatedQuery = pagination(baseQuery as unknown as PgQueryType, pageSize, pageNumber, totalCount);
    
    
    if (filters.sort_by) {
      baseQuery.orderBy(sql`${sql.identifier(filters.sort_by)} ${sql.raw(filters.sort_order || 'ASC')}`);
    }

    // Execute the paginated query
    const paginatedData = await paginatedQuery.query;

    return {
        pagination: paginatedQuery.pagination,
        data: paginatedData
    };

}

export const getSagByTokenId = async (tokenId: string) => {
    if (!tokenId) {
        throw new Error('Token ID is required');
    }
    return await db.select().from(SagModel).where(eq(SagModel.tokenId, tokenId)).limit(1);
}

export const getOriginalOwnerByTokenId = async (tokenId: string) => {
    if (!tokenId) {
        throw new Error('Token ID is required');
    }
    const sagInfo = await db.select().from(SagModel).where(eq(SagModel.tokenId, tokenId)).limit(1);
    if (!sagInfo) {
        throw new Error('SAG info not found');
    }
    return sagInfo[0].originalOwner;
}

export const updateSag = async (sagId: string, sagData: Partial<SagModelInsertType>, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
    if (!sagId || !sagData) {
        throw new Error('No SAG ID or sag data are provided');
    }
    if (tx) {
        return await tx.update(SagModel).set(sagData).where(eq(SagModel.sagId, sagId)).returning();
    }
    return await db.update(SagModel).set(sagData).where(eq(SagModel.sagId, sagId)).returning();
}

export const overrideFailureSag = async (validatedData: { sag_id: string; risk_level?: string; recommended_action?: string; ltv?: number; sagProperties?: any }, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
    if (!validatedData) {
        throw new Error('No validated data are provided');
    }
    const existingSag = await db.select().from(SagModel).where(eq(SagModel.sagId, validatedData.sag_id)).limit(1);
    if (!existingSag) {
        throw new Error('SAG not found');
    }   
    if (tx) {
        return await tx.update(SagModel).set({
            sagProperties: {
                ...(existingSag[0].sagProperties as any),
                risk_level: validatedData.risk_level,
                recommended_action: validatedData.recommended_action,
                ltv: validatedData.ltv
            }
        }).where(eq(SagModel.sagId, validatedData.sag_id)).returning();
    }
    return await db.update(SagModel).set({
        sagProperties: {
            ...(existingSag[0].sagProperties as any),
            risk_level: validatedData.risk_level,
            recommended_action: validatedData.recommended_action,
            ltv: validatedData.ltv
        }
    }).where(eq(SagModel.sagId, validatedData.sag_id)).returning();
}