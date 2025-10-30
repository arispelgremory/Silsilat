import { timestamp, uuid, varchar, text, boolean, decimal } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

// Hedera Account Type
export type HederaAccountType = {
  accountId?: string; // UUID type
  hederaAccountId: string; // Hedera account ID (e.g., "0.0.123456")
  accountName: string;
  publicKey: string;
  privateKey?: string | null; // Optional for security reasons
  accountType: 'OPERATOR' | 'USER' | 'SYSTEM';
  balance?: string; // Hbar balance as string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isOperator: boolean;
  network: 'testnet' | 'mainnet' | 'previewnet';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy: string;
}

// Hedera Account Database Schema
export const HederaAccount = MainSchema.table('hedera_account', {
  accountId: uuid('account_id').defaultRandom().primaryKey(),
  hederaAccountId: varchar('hedera_account_id', { length: 20 }).unique().notNull(),
  accountName: varchar('account_name', { length: 100 }).notNull(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key'), // Encrypted private key
  accountType: varchar('account_type', { length: 20 }).notNull(),
  balance: decimal('balance', { precision: 20, scale: 2 }),
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  isOperator: boolean('is_operator').notNull().default(false),
  network: varchar('network', { length: 20 }).notNull().default('testnet'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 40 }).notNull(),
  updatedBy: varchar('updated_by', { length: 40 }).notNull(),
});

// Account Creation Request
export type CreateAccountRequest = {
  accountName: string;
  accountType: 'OPERATOR' | 'USER' | 'SYSTEM';
  network?: 'testnet' | 'mainnet' | 'previewnet';
  isOperator?: boolean;
}

// Account Update Request
export type UpdateAccountRequest = {
  accountId: string;
  accountName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isOperator?: boolean;
}

// Account Balance Response
export type AccountBalanceResponse = {
  hederaAccountId: string;
  balance: string;
  balanceInHbar: string;
  network: string;
}

// Account Info Response
export type AccountInfoResponse = {
  accountId: string;
  hederaAccountId: string;
  accountName: string;
  publicKey: string;
  accountType: string;
  balance: string;
  status: string;
  isOperator: boolean;
  network: string;
  createdAt: Date;
  updatedAt: Date;
}

// Account List Response
export type AccountListResponse = {
  accounts: AccountInfoResponse[];
  total: number;
  page: number;
  limit: number;
}
