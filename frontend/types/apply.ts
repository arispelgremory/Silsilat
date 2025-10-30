// Types for the jewelry application process

export interface JewelrySubmissionData {
  jewelryType: string
  jewelrySubtype: string
  weight: number
  karat: string
  images: string[]
  additionalDetails?: string
}

export interface AIAssessmentResponse {
  assessmentId: string
  estimatedValue: number
  confidenceLevel: number
  riskScore: number
  recommendations: string[]
  requiresManualReview: boolean
  // AI Risk Analysis Fields
  ltv?: number
  risk_level?: string
  rationale?: string
  action?: string
  purity?: number
  eval_id?: string
}

export interface LoanApplicationData {
  jewelryItemId: string
  loanProductId: string
  requestedAmount: number
  requestedDurationDays: number
  purpose?: string
  monthlyIncome?: number
  employmentStatus?: string
  paymentFrequency: string
}

export interface LoanApplicationResponse {
  applicationId: string
  applicationNumber: string
  status: string
  estimatedProcessingTime: string
}

export interface LoanDetails {
  jewelryType: string
  jewelryValue: number
  loanAmount: number
  profitRate: number
  startDate: string
  endDate: string
}

export interface ImageUploadResponse {
  imageUrls: string[]
  message: string
}

export interface JewelrySubmissionResponse {
  submissionId: string
  status: string
  message: string
}
