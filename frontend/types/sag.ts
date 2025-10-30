export interface SAGProperties {
  loan: number;
  karat: number;
  tenorM: number;
  weightG: number;
  currency: string;
  assetType: string;
  mintShare: number;
  soldShare: number;
  valuation: number;
  enableMinting: boolean;
  loanPercentage: number;
  pawnerInterestP: number;
  investorFinancingType: string;
  investorRoiPercentage: number;
  investorRoiFixedAmount: number;
  // AI Risk Analysis Fields
  ltv?: number;
  risk_level?: string;
  rationale?: string;
  purity?: number;
  action?: string;
  eval_id?: string;
}

export interface SAG {
  sagId: string;
  tokenId: string;
  sagName: string;
  sagDescription: string;
  sagProperties: SAGProperties;
  sagType: string;
  certNo: string;
  status: 'active' | 'closed' | 'pending';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  closedAt: string | null;
}

export interface Pagination {
  count: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SAGResponse {
  success: boolean;
  message: string;
  data: SAG[];
  pagination: Pagination;
}

export interface SAGApiParams {
  page?: number;
  page_size?: number;
  status?: string;
  enableMinting?: boolean;
  sort_by?: string;
  sort_order?: string;
}

export interface TokenData {
  tokenId: string;
  remainingSupply: string;
  totalSupply: string;
  treasuryAccountId: string;
  createdAt: string;
  expiredAt: string;
}

export interface TokenResponse {
  success: boolean;
  data: TokenData;
}

export interface SAGWithTokenData extends SAG {
  tokenData?: TokenData;
  actualMintedShares?: number;
  actualRemainingShares?: number;
}
