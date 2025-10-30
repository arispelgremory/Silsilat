import { z } from 'zod';
import { PrivateKey } from '@hashgraph/sdk';

// Purchase Token Schema
export const PurchaseTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1').max(100, 'Amount cannot exceed 100'),
  totalValue: z.number().positive().min(1, 'Total value must be at least 1'),
  serialNumber: z.number().int().min(1, 'Serial number must be at least 1').optional()
});

// Purchase Token Response Schema
export const PurchaseTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    tokenId: z.string(),
    serialNumbers: z.array(z.number()),
    investorAccountId: z.string(),
    transferTransactionId: z.string(),
    freezeTransactionId: z.string(),
    transferReceipt: z.any(),
    freezeReceipt: z.any(),
    associationTransactionId: z.string(),
    associationReceipt: z.any(),
    warning: z.string().optional(),
    batches: z.array(z.object({
      batchNumber: z.number(),
      serialNumbers: z.array(z.number()),
      transferTransactionId: z.string(),
      transferReceipt: z.any(),
      success: z.boolean(),
      error: z.string().optional()
    })).optional()
  }).optional(),
  error: z.string().optional()
});

// Get Account NFT Info Response Schema
export const GetInvestorNFTInfoResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    nfts: z.array(z.any())
  }).optional(),
  error: z.string().optional()
});

// Type definitions
export type PurchaseTokenRequest = z.infer<typeof PurchaseTokenSchema>;
export type PurchaseTokenResponse = z.infer<typeof PurchaseTokenResponseSchema>;
export type GetInvestorNFTInfoResponse = z.infer<typeof GetInvestorNFTInfoResponseSchema>;

// Interface for purchase token parameters
export interface PurchaseTokenParams {
  tokenId: string;
  serialNumbers: number[];
  investorAccountId: string;
  investorPrivateKey: PrivateKey;
  pawnShopAccountId: string;
  pawnShopPrivateKey: PrivateKey;
  freezeKey: PrivateKey;
}


