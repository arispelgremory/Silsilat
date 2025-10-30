import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { z } from 'zod';
import { timestamp, uuid, varchar, text, boolean, jsonb, PgInetBuilder, numeric } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

export const Token = MainSchema.table('token', {
  tokenId:        varchar('token_id', { length: 40 }).notNull(),
  transactionId:  varchar('transaction_id', { length: 40 }).notNull(),
  status:         varchar('status', { length: 20 }).notNull(),
  expiredAt:      timestamp('expired_at').notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});

export const FungibleToken = MainSchema.table('fungible_token', {
  tokenId:        varchar('token_id', { length: 40 }).notNull(),
  transactionId:  varchar('transaction_id', { length: 40 }).notNull(),
  status:         varchar('status', { length: 20 }).notNull(),
  amount:         varchar('amount', { length: 40 }).notNull(),
  price:          numeric('price', { precision: 20, scale: 2 }).notNull(),
  expiredAt:      timestamp('expired_at').notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});
export interface CreateTokenParams {
  name: string;
  symbol: string;
  expiredAt: string;
  treasuryAccountId: string;
  treasuryPrivateKey: PrivateKey;
  adminKey?: PublicKey;
  supplyKey?: PublicKey;
  freezeKey?: PublicKey;
  wipeKey?: PublicKey;
  metadata?: string;
  customFees?: any[];
}
export interface MintTokenParams {
  tokenId: string;
  amount?: number;
  supplyKey: PrivateKey;
  metadata?: string;
}

export interface CreateFungibleTokenParams {
  name: string;
  symbol: string;
  expiredAt: string;
  treasuryAccountId: string;
  treasuryPrivateKey: PrivateKey;
  supplyKey: PublicKey;
  initialSupply?: number;
  price?: number;
  adminKey?: PublicKey;
  freezeKey?: PublicKey;
  wipeKey?: PublicKey;
  metadata?: string;
  customFees?: any[];
}

export interface TransferFungibleTokenParams {
  tokenId: string;
  senderAccountId: string;
  senderPrivateKey: PrivateKey;
  recipientAccountId: string;
  amount: number;
}

export interface MintFungibleTokenParams {
  tokenId: string;
  amount: number;
  supplyKey: PrivateKey;
}

export interface FreezeTokenParams {
  tokenId: string;
  accountId: string;
  freezeKey: PrivateKey;
}

export interface BurnTokenParams {
  tokenId: string;
  serials: number[];
  supplyKey: PrivateKey;
}

export interface WipeTokenParams {
  tokenId: string;
  accountId: string;
  serials: number[];
  wipeKey: PrivateKey;
}

export interface AssociateTokenParams {
  accountId: string;
  privateKey: PrivateKey;
  tokenId: string;
}

export interface TransferTokenParams {
  tokenId: string;
  senderAccountId: string;
  senderPrivateKey: PrivateKey;
  recipientAccountId: string;
  serialNumber: number;
}

// Create Token Schema
export const CreateTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(100, 'Token name must be less than 100 characters'),
  symbol: z.string().min(1, 'Token symbol is required').max(10, 'Token symbol must be less than 10 characters'),
  expiredAt: z.date(),
  treasuryAccountId: z.string().min(1, 'Treasury account ID is required').optional(),
  treasuryPrivateKey: z.string().min(1, 'Treasury private key is required').optional(),
  adminKey: z.string().optional(),
  supplyKey: z.string().optional(),
  freezeKey: z.string().optional(),
  wipeKey: z.string().optional(),
  metadata: z.string().optional(),
  customFees: z.array(z.any()).optional()
});

// Create Fungible Token Schema
export const CreateFungibleTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required').max(100, 'Token name must be less than 100 characters'),
  symbol: z.string().min(1, 'Token symbol is required').max(10, 'Token symbol must be less than 10 characters'),
  expiredAt: z.date(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()).optional(),
  treasuryAccountId: z.string().min(1, 'Treasury account ID is required').optional(),
  treasuryPrivateKey: z.string().min(1, 'Treasury private key is required').optional(),
  initialSupply: z.number().int().min(1, 'Initial supply must be at least 1').optional(),
  price: z.number().int().min(1, 'Price must be at least 1').optional(),
  adminKey: z.string().optional(),
  supplyKey: z.string().optional(),
  freezeKey: z.string().optional(),
  wipeKey: z.string().optional(),
  metadata: z.string().optional(),
  customFees: z.array(z.any()).optional()
});

// Mint Token Schema
export const MintTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1').optional(),
  supplyKey: z.string().optional(),
  metadata: z.union([
    // Single metadata object
    z.record(z.string(), z.any()),
    // Array of metadata (strings or objects)
    z.array(z.union([z.string(), z.record(z.string(), z.any())]))
  ]).optional()
});

// Mint Fungible Token Schema
export const MintFungibleTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1')
});

// Freeze Token Schema
export const FreezeTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  freezeKey: z.string().min(1, 'Freeze key is required')
});

// Unfreeze Token Schema (same as freeze)
export const UnfreezeTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  freezeKey: z.string().min(1, 'Freeze key is required')
});

// Burn Token Schema
export const BurnTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  serials: z.array(z.number().int().min(1, 'Serial number must be at least 1')).min(1, 'At least one serial number is required'),
  supplyKey: z.string().min(1, 'Supply key is required')
});

// Wipe Token Schema
export const WipeTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  serials: z.array(z.number().int().min(1, 'Serial number must be at least 1')).min(1, 'At least one serial number is required'),
  wipeKey: z.string().min(1, 'Wipe key is required')
});

// Associate Token Schema
export const AssociateTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  privateKey: z.string().min(1, 'Private key is required')
});

// Transfer Token Schema
export const TransferTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  senderAccountId: z.string().min(1, 'Sender account ID is required'),
  senderPrivateKey: z.string().min(1, 'Sender private key is required'),
  recipientAccountId: z.string().min(1, 'Recipient account ID is required'),
  serialNumber: z.number().int().min(1, 'Serial number must be at least 1')
});

// Transfer Fungible Token Schema
export const TransferFungibleTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  senderAccountId: z.string().min(1, 'Sender account ID is required'),
  senderPrivateKey: z.string().min(1, 'Sender private key is required'),
  recipientAccountId: z.string().min(1, 'Recipient account ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1')
});

// Top Up Token Schema
export const TopUpTokenSchema = z.object({
  // tokenId: z.string().min(1, 'Token ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1')
});

// Response Schemas
export const CreateTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tokenId: z.string(),
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const MintTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    serialNumbers: z.array(z.number()),
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const CreateFungibleTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tokenId: z.string(),
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
}); 

export const MintFungibleTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    newTotalSupply: z.string(),
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const FreezeTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const BurnTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const WipeTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const AssociateTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

export const TransferTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

// Get Token Response Schema
export const GetTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tokenId: z.string(),
    remainingSupply: z.string(),
    totalSupply: z.string(),
    treasuryAccountId: z.string(),
    createdAt: z.string(), // Hedera timestamp format
    expiredAt: z.string(), // Hedera timestamp format (createdAt + 6 months)
  }).optional(),
  error: z.string().optional()
});

export const TopUpTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});

// Type definitions
export type CreateTokenRequest = z.infer<typeof CreateTokenSchema>;
export type MintTokenRequest = z.infer<typeof MintTokenSchema>;
export type CreateFungibleTokenRequest = z.infer<typeof CreateFungibleTokenSchema>;
export type MintFungibleTokenRequest = z.infer<typeof MintFungibleTokenSchema>;
export type FreezeTokenRequest = z.infer<typeof FreezeTokenSchema>;
export type UnfreezeTokenRequest = z.infer<typeof UnfreezeTokenSchema>;
export type BurnTokenRequest = z.infer<typeof BurnTokenSchema>;
export type WipeTokenRequest = z.infer<typeof WipeTokenSchema>;
export type AssociateTokenRequest = z.infer<typeof AssociateTokenSchema>;
export type TransferTokenRequest = z.infer<typeof TransferTokenSchema>;
export type TopUpTokenRequest = z.infer<typeof TopUpTokenResponseSchema>;
export type CreateTokenResponse = z.infer<typeof CreateTokenResponseSchema>;
export type MintTokenResponse = z.infer<typeof MintTokenResponseSchema>;
export type MintFungibleTokenResponse = z.infer<typeof MintFungibleTokenResponseSchema>;
export type CreateFungibleTokenResponse = z.infer<typeof CreateFungibleTokenResponseSchema>;
export type FreezeTokenResponse = z.infer<typeof FreezeTokenResponseSchema>;
export type BurnTokenResponse = z.infer<typeof BurnTokenResponseSchema>;
export type WipeTokenResponse = z.infer<typeof WipeTokenResponseSchema>;
export type AssociateTokenResponse = z.infer<typeof AssociateTokenResponseSchema>;
export type TransferTokenResponse = z.infer<typeof TransferTokenResponseSchema>;
export type GetTokenResponse = z.infer<typeof GetTokenResponseSchema>;
export type TopUpTokenResponse = z.infer<typeof TopUpTokenResponseSchema>;
export type FungibleTokenInsertType = typeof FungibleToken.$inferInsert;

