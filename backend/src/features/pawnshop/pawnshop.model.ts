import { z } from 'zod';
import { PrivateKey } from '@hashgraph/sdk';

// Repayment process parameters
export interface RepaymentParams {
  tokenId: string;
  pawnshopAccountId: string;
  pawnshopPrivateKey: PrivateKey;
  freezeKey: PrivateKey;
  supplyKey: PrivateKey;
}

// Repayment result
export interface RepaymentResult {
  tokenId: string;
  totalHolders: number;
  totalTokensProcessed: number;
  unfreezeTransactions: Array<{
    accountId: string;
    transactionId: string;
    receipt: any;
  }>;
  transferTransactions: Array<{
    accountId: string;
    serialNumbers: number[];
    transactionId: string;
    receipt: any;
  }>;
  burnTransaction: {
    transactionId: string;
    receipt: any;
    totalBurned: number;
  };
  success: boolean;
  error?: string;
}

// Request schema for repayment API
export const RepaymentRequestSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  sagId: z.string().min(1, 'SAG ID is required'),
  pawnshopAccountId: z.string().min(1, 'Pawnshop account ID is required').optional(),
});

// Response schema for repayment API
export const RepaymentResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tokenId: z.string(),
    totalHolders: z.number(),
    totalTokensProcessed: z.number(),
    unfreezeTransactions: z.array(z.object({
      accountId: z.string(),
      transactionId: z.string(),
      receipt: z.any(),
    })),
    transferTransactions: z.array(z.object({
      accountId: z.string(),
      serialNumbers: z.array(z.number()),
      transactionId: z.string(),
      receipt: z.any(),
    })),
    burnTransaction: z.object({
      transactionId: z.string(),
      receipt: z.any(),
      totalBurned: z.number(),
    }),
  }).optional(),
  error: z.string().optional(),
});

// Type definitions
export type RepaymentRequest = z.infer<typeof RepaymentRequestSchema>;
export type RepaymentResponse = z.infer<typeof RepaymentResponseSchema>;
