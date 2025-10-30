import { MainSchema } from "@/db/db.schema";
import { jsonb, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

export const SagModel = MainSchema.table('sag', {
    sagId: uuid('sag_id').primaryKey().defaultRandom().notNull(),
    tokenId: varchar('token_id', { length: 40 }).default(''),
    sagName: text('sag_name').notNull(),
    sagDescription: text('sag_description').default(''),
    sagProperties: jsonb('sag_properties').default({}),
    sagType: text('sag_type').default('Conventional'),
    certNo: varchar('cert_no', { length: 40 }).unique(),
    status: varchar('status', { length: 20 }).default('active'),
    approvalStatus: varchar('approval_status', { length: 20 }).default('pending'),
    originalOwner: varchar('original_owner', { length: 40 }).default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    closedAt: timestamp('closed_at')
});

export const SagSchema = z.object({
    sagName: z.string().min(1, 'SAG name is required'),
    sagDescription: z.string().min(1, 'SAG description is required'),
    tokenId: z.string().optional(),
    expiredAt: z.string(),
    certNo: z.string(),
    originalOwner: z.string().optional(),
    sagProperties: z.object({
        assetType: z.string(),
        karat: z.number(),
        weightG: z.number(),
        valuation: z.number(),
        enableMinting: z.boolean(),
        mintShare: z.number(),
        soldShare: z.number().default(0),
        investorFinancingType: z.string(),
        investorRoiPercentage: z.number(),
        investorRoiFixedAmount: z.number(),
        currency: z.string(),
        loanPercentage: z.number(),
        loan: z.number(),
        pawnerInterestP: z.number(),
        tenorM: z.number(),
        purity: z.number(),
        imageUrl: z.array(z.string()).optional()
    }),
    sagType: z.string().optional(),
});

export type SagModelType = typeof SagModel.$inferSelect;
export type SagModelInsertType = typeof SagModel.$inferInsert;

export type SagFilter = {
    id?: string;
    status?: string;
    certNo?: string;
    tokenId?: string;
    ltv?: number;
    risk_level?: string;
    action?: string;
    page_size?: number;
    page_number?: number;
    sort_by?: string;
    sort_order?: string;
}

export const GoldEvaluatorOutputSchema = z.object({
    risk_level: z.string(),
    ltv: z.number(),
    collateral_value_myr: z.number(),
    action: z.string(),
    rationale: z.string(),
    eval_id: z.string()
})

export const SagOverrideFailureSchema = z.object({
    sag_id: z.string().min(1, 'SAG ID is required'),
    risk_level: z.string().min(1, 'Risk level is required').optional(),
    action: z.string().min(1, 'Recommended action is required').optional(),
    ltv: z.number().min(0, 'LTV is required').optional()
})