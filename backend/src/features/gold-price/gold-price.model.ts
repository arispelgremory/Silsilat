import { MainSchema } from "@/db/db.schema";
import { decimal, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

// Gold Price Database Model
export const GoldPrice = MainSchema.table('gold_price', {
    id: uuid('id').primaryKey().defaultRandom().notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    pricePerGramUsd: decimal('price_per_gram_usd', { precision: 10, scale: 2 }).notNull(),
    pricePerGramMyr: decimal('price_per_gram_myr', { precision: 10, scale: 2 }).notNull(),
    exchangeRate: decimal('exchange_rate', { precision: 10, scale: 4 }).notNull(),
    source: varchar('source', { length: 50 }).default('manual').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Zod Schema for validation
export const GoldPriceSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    pricePerGramUsd: z.number().positive('USD price per gram must be positive'),
    pricePerGramMyr: z.number().positive('MYR price per gram must be positive'),
    exchangeRate: z.number().positive('Exchange rate must be positive'),
    source: z.string().min(1, 'Source is required').default('manual')
});

export const GoldPriceUpdateSchema = z.object({
    pricePerGramUsd: z.number().positive('USD price per gram must be positive').optional(),
    pricePerGramMyr: z.number().positive('MYR price per gram must be positive').optional(),
    exchangeRate: z.number().positive('Exchange rate must be positive').optional(),
    source: z.string().min(1, 'Source is required').optional()
});

export const GoldPriceQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    source: z.string().optional(),
    page_size: z.number().int().positive().default(10),
    page_number: z.number().int().nonnegative().default(1),
    sort_by: z.string().optional(),
    sort_order: z.enum(['ASC', 'DESC']).default('DESC')
});

// Type definitions
export type GoldPriceType = typeof GoldPrice.$inferSelect;
export type GoldPriceInsertType = typeof GoldPrice.$inferInsert;
export type GoldPriceRequest = z.infer<typeof GoldPriceSchema>;
export type GoldPriceUpdateRequest = z.infer<typeof GoldPriceUpdateSchema>;
export type GoldPriceQuery = z.infer<typeof GoldPriceQuerySchema>;

// Filter interface for repository
export type GoldPriceFilter = {
    startDate?: string;
    endDate?: string;
    source?: string;
    page_size?: number;
    page_number?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
};
