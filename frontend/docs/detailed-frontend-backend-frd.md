# Suyula Liquid Platform - Detailed Frontend & Backend Functional Requirements Document

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [User Management Module](#user-management-module)
4. [KYC Verification Module](#kyc-verification-module)
5. [Jewelry Submission Module](#jewelry-submission-module)
6. [SAG Management Module](#sag-management-module)
7. [Payment Processing Module](#payment-processing-module)
8. [Wallet Integration Module](#wallet-integration-module)
9. [Dashboard Modules](#dashboard-modules)
10. [AI Risk & Compliance Module](#ai-risk--compliance-module)
11. [Notification System](#notification-system)
12. [Reporting & Analytics](#reporting--analytics)
13. [API Specifications](#api-specifications)
14. [Database Schema Mapping](#database-schema-mapping)

---

## 1. Executive Summary

This document provides comprehensive functional requirements for the Suyula Liquid platform, detailing every frontend field and its corresponding backend implementation. The platform serves as a Shariah-compliant gold tokenization system connecting Ar-Rahnu operators with investors.

### Key Stakeholders
- **Investors**: Individuals seeking Shariah-compliant investment opportunities
- **Ar-Rahnu Operators**: Gold loan service providers requiring liquidity
- **Administrators**: Platform managers overseeing operations
- **CEO/Management**: Executive oversight and strategic decision making

---

## 2. System Architecture Overview

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: React hooks and context
- **Authentication**: JWT-based with role-based access control

### Backend Architecture
- **API**: RESTful services with GraphQL for complex queries
- **Database**: PostgreSQL with Redis caching
- **Blockchain**: Hedera Hashgraph integration
- **File Storage**: AWS S3 for document storage

---

## 3. User Management Module

### 3.1 User Registration

#### Frontend Fields (app/register/page.tsx)
\`\`\`typescript
interface RegistrationForm {
  firstName: string          // Required, 2-50 characters
  lastName: string           // Required, 2-50 characters  
  email: string             // Required, valid email format
  password: string          // Required, min 8 chars, 1 uppercase, 1 number
  confirmPassword: string   // Required, must match password
  agreeTerms: boolean      // Required, must be true
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/auth/register
interface UserRegistrationRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
  ipAddress?: string
  userAgent?: string
  registrationSource: 'web' | 'mobile'
}

interface UserRegistrationResponse {
  success: boolean
  userId: string
  message: string
  verificationEmailSent: boolean
  errors?: ValidationError[]
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'active',
  terms_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  registration_ip INET,
  registration_user_agent TEXT
);
\`\`\`

#### Field Validations & Business Rules
- **firstName/lastName**: Trim whitespace, validate against special characters
- **email**: Unique constraint, email format validation, domain blacklist check
- **password**: Hash using bcrypt with salt rounds 12
- **agreeTerms**: Must be true, timestamp recorded in terms_accepted_at
- **Registration Flow**: Email verification required before account activation

### 3.2 User Login

#### Frontend Fields (app/login/page.tsx)
\`\`\`typescript
interface LoginForm {
  email: string        // Required, email format
  password: string     // Required
  rememberMe?: boolean // Optional, extends session
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/auth/login
interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  ipAddress?: string
  userAgent?: string
}

interface LoginResponse {
  success: boolean
  accessToken: string
  refreshToken: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    kycStatus: string
    walletConnected: boolean
  }
  expiresIn: number
}
\`\`\`

#### Security Implementation
- **Rate Limiting**: 5 attempts per 15 minutes per IP
- **Account Lockout**: 5 failed attempts locks account for 30 minutes
- **JWT Tokens**: Access token (15 min), Refresh token (7 days)
- **Session Management**: Track active sessions, allow logout from all devices

---

## 4. KYC Verification Module

### 4.1 Personal Information Step

#### Frontend Fields (components/apply/kyc-verification.tsx)
\`\`\`typescript
interface PersonalInfoForm {
  firstName: string        // Required, 2-50 chars, matches registration
  lastName: string         // Required, 2-50 chars, matches registration
  email: string           // Required, matches registration, readonly
  phone: string           // Required, Malaysian format validation
  address: string         // Required, 10-200 chars
  city: string           // Required, 2-50 chars
  state: string          // Required, Malaysian states dropdown
  postalCode: string     // Required, Malaysian postal code format
  dateOfBirth: string    // Required, age 18-80, ISO date format
  nationality: string    // Required, dropdown selection
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/kyc/personal-info
interface PersonalInfoRequest {
  userId: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  dateOfBirth: string
  nationality: string
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE kyc_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status kyc_status DEFAULT 'draft',
  risk_score risk_level,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kyc_personal_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_application_id UUID REFERENCES kyc_applications(id),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 4.2 ID Verification Step

#### Frontend Fields
\`\`\`typescript
interface IDVerificationForm {
  idType: 'myKad' | 'passport'    // Required, radio selection
  idNumber: string                // Required, format based on idType
  idFrontImage: File             // Required, image file max 5MB
  idBackImage: File              // Required, image file max 5MB
  expiryDate?: string            // Required for passport
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/kyc/id-verification
interface IDVerificationRequest {
  kycApplicationId: string
  idType: 'myKad' | 'passport'
  idNumber: string
  expiryDate?: string
}

// API Endpoint: POST /api/kyc/upload-document
interface DocumentUploadRequest {
  kycApplicationId: string
  documentType: 'id_front' | 'id_back' | 'selfie'
  file: File
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_application_id UUID REFERENCES kyc_applications(id),
  document_type document_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  upload_status upload_status DEFAULT 'pending',
  ai_verification_result JSONB,
  manual_verification_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kyc_id_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_application_id UUID REFERENCES kyc_applications(id),
  id_type id_type NOT NULL,
  id_number VARCHAR(50) NOT NULL,
  expiry_date DATE,
  verification_status verification_status DEFAULT 'pending',
  ai_extracted_data JSONB,
  manual_review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### AI Verification Process
- **OCR Extraction**: Extract text from ID documents
- **Face Matching**: Compare ID photo with selfie
- **Document Authenticity**: Verify security features
- **Data Validation**: Cross-check extracted data with form inputs

### 4.3 Facial Verification Step

#### Frontend Fields
\`\`\`typescript
interface FacialVerificationForm {
  selfieImage: File              // Required, image file max 5MB
  livenessCheck: boolean         // Required, webcam capture preferred
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/kyc/facial-verification
interface FacialVerificationRequest {
  kycApplicationId: string
  livenessCheckPassed: boolean
}
\`\`\`

#### AI Processing Pipeline
1. **Liveness Detection**: Verify real person vs photo/video
2. **Face Quality Assessment**: Check lighting, angle, clarity
3. **Face Matching**: Compare with ID document photo
4. **Biometric Storage**: Store facial template (encrypted)

---

## 5. Jewelry Submission Module

### 5.1 Jewelry Details Form

#### Frontend Fields (components/apply/jewelry-submission.tsx)
\`\`\`typescript
interface JewelrySubmissionForm {
  jewelryType: 'gold' | 'silver' | 'diamond'    // Required, radio selection
  jewelrySubtype: string                        // Required, dropdown based on type
  weight: number                                // Required, 0.1-1000 range
  karat?: string                               // Required for gold, dropdown
  brand?: string                               // Optional, text input
  purchaseDate?: string                        // Optional, date picker
  purchasePrice?: number                       // Optional, currency input
  condition: 'excellent' | 'good' | 'fair'    // Required, radio selection
  description: string                          // Optional, textarea max 500 chars
  images: File[]                              // Required, 3-8 images, max 5MB each
  certificates?: File[]                        // Optional, authenticity certificates
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/jewelry/submit
interface JewelrySubmissionRequest {
  userId: string
  jewelryType: string
  jewelrySubtype: string
  weight: number
  karat?: string
  brand?: string
  purchaseDate?: string
  purchasePrice?: number
  condition: string
  description?: string
  estimatedValue?: number
}

interface JewelrySubmissionResponse {
  success: boolean
  submissionId: string
  estimatedValue: number
  potentialLoanAmount: number
  aiAssessmentId: string
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE jewelry_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  jewelry_type jewelry_type NOT NULL,
  jewelry_subtype VARCHAR(50) NOT NULL,
  weight DECIMAL(10,3) NOT NULL,
  karat VARCHAR(10),
  brand VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(12,2),
  condition jewelry_condition NOT NULL,
  description TEXT,
  estimated_value DECIMAL(12,2),
  ai_assessment_confidence DECIMAL(3,2),
  status submission_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jewelry_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jewelry_submission_id UUID REFERENCES jewelry_submissions(id),
  image_path VARCHAR(500) NOT NULL,
  image_type image_type NOT NULL,
  file_size INTEGER NOT NULL,
  ai_analysis_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jewelry_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jewelry_submission_id UUID REFERENCES jewelry_submissions(id),
  certificate_type VARCHAR(50) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  issuer VARCHAR(100),
  issue_date DATE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 5.2 AI Jewelry Assessment

#### AI Processing Pipeline
\`\`\`typescript
interface AIAssessmentProcess {
  imageAnalysis: {
    metalDetection: boolean
    colorAnalysis: RGB[]
    textureAnalysis: number
    shapeRecognition: string
    qualityScore: number
  }
  marketValuation: {
    currentGoldPrice: number
    weightVerification: number
    karatVerification: string
    marketPremium: number
    estimatedValue: number
    confidenceLevel: number
  }
  riskAssessment: {
    authenticityScore: number
    conditionScore: number
    marketabilityScore: number
    overallRisk: 'low' | 'medium' | 'high'
  }
}
\`\`\`

#### Backend Processing
\`\`\`typescript
// API Endpoint: POST /api/ai/assess-jewelry
interface AIAssessmentRequest {
  submissionId: string
  images: string[]  // S3 URLs
  jewelryDetails: JewelrySubmissionRequest
}

interface AIAssessmentResponse {
  assessmentId: string
  estimatedValue: number
  confidenceLevel: number
  riskScore: number
  recommendations: string[]
  requiresManualReview: boolean
}
\`\`\`

---

## 6. SAG Management Module

### 6.1 SAG Creation (Ar-Rahnu Interface)

#### Frontend Fields
\`\`\`typescript
interface SAGCreationForm {
  // Borrower Information
  borrowerName: string              // Required, 2-100 chars
  borrowerIC: string               // Required, Malaysian IC format
  borrowerPhone: string            // Required, Malaysian phone format
  borrowerAddress: string          // Required, full address
  
  // Jewelry Details
  jewelryType: string              // Required, dropdown
  jewelryDescription: string       // Required, detailed description
  jewelryWeight: number           // Required, in grams
  jewelryKarat: string            // Required for gold
  jewelryImages: File[]           // Required, 3-10 images
  
  // Loan Details
  loanAmount: number              // Required, min 100, max based on jewelry value
  loanDuration: number            // Required, 1-24 months
  profitRate: number              // Required, 3-12% annual
  collateralValue: number         // Required, jewelry assessed value
  
  // SAG Details
  sagTitle: string                // Required, descriptive title
  sagDescription: string          // Required, investor-facing description
  raisePercentage: number         // Required, 1-80% of loan amount
  minimumInvestment: number       // Required, min investment per investor
  expectedReturn: number          // Calculated field
  maturityDate: string           // Calculated based on duration
  
  // Branch Information
  branchCode: string             // Auto-filled, current user's branch
  branchName: string             // Auto-filled, readonly
  officerName: string            // Auto-filled, current user
  officerID: string              // Auto-filled, current user ID
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/sag/create
interface SAGCreationRequest {
  // Borrower data
  borrower: {
    name: string
    icNumber: string
    phone: string
    address: string
    kycStatus?: string
  }
  
  // Jewelry data
  jewelry: {
    type: string
    description: string
    weight: number
    karat?: string
    assessedValue: number
    images: string[]  // S3 URLs after upload
  }
  
  // Loan terms
  loan: {
    amount: number
    duration: number
    profitRate: number
    startDate: string
    maturityDate: string
  }
  
  // SAG configuration
  sag: {
    title: string
    description: string
    raisePercentage: number
    minimumInvestment: number
    targetAmount: number
    expectedReturn: number
  }
  
  // Branch info
  branch: {
    code: string
    officerId: string
  }
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE sag_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sag_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  
  -- Financial details
  loan_amount DECIMAL(12,2) NOT NULL,
  raise_percentage DECIMAL(5,2) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) DEFAULT 0,
  minimum_investment DECIMAL(12,2) NOT NULL,
  profit_rate DECIMAL(5,2) NOT NULL,
  expected_return DECIMAL(5,2) NOT NULL,
  
  -- Timeline
  loan_duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  listing_date DATE DEFAULT CURRENT_DATE,
  
  -- Status
  status sag_status DEFAULT 'draft',
  approval_status approval_status DEFAULT 'pending',
  
  -- References
  borrower_id UUID REFERENCES borrowers(id),
  jewelry_id UUID REFERENCES jewelry_items(id),
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP
);

CREATE TABLE borrowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  ic_number VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  kyc_status kyc_status DEFAULT 'pending',
  risk_rating risk_level,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jewelry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type jewelry_type NOT NULL,
  description TEXT NOT NULL,
  weight DECIMAL(10,3) NOT NULL,
  karat VARCHAR(10),
  assessed_value DECIMAL(12,2) NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_id UUID REFERENCES users(id),
  condition jewelry_condition NOT NULL,
  storage_location VARCHAR(100),
  insurance_value DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 6.2 SAG Investment Interface

#### Frontend Fields (Investor View)
\`\`\`typescript
interface SAGInvestmentForm {
  sagId: string                   // Hidden, selected SAG
  investmentAmount: number        // Required, min/max validation
  investmentDuration: number      // Readonly, from SAG details
  expectedReturn: number          // Readonly, calculated
  paymentMethod: 'hedera' | 'bank' | 'card'  // Required, radio selection
  
  // Payment details (conditional based on method)
  walletAddress?: string          // For Hedera payments
  bankAccount?: {
    accountNumber: string
    bankName: string
    accountHolder: string
  }
  cardDetails?: {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardHolder: string
  }
  
  // Agreement
  agreeToTerms: boolean          // Required
  riskAcknowledgment: boolean    // Required
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/sag/invest
interface SAGInvestmentRequest {
  sagId: string
  investorId: string
  investmentAmount: number
  paymentMethod: string
  paymentDetails: any  // Encrypted payment info
  agreeToTerms: boolean
  riskAcknowledgment: boolean
}

interface SAGInvestmentResponse {
  success: boolean
  investmentId: string
  transactionId: string
  nftTokenId?: string  // If Hedera NFT created
  expectedMaturityDate: string
  expectedReturn: number
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE sag_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sag_id UUID REFERENCES sag_listings(id),
  investor_id UUID REFERENCES users(id),
  investment_amount DECIMAL(12,2) NOT NULL,
  investment_date DATE DEFAULT CURRENT_DATE,
  expected_return DECIMAL(12,2) NOT NULL,
  actual_return DECIMAL(12,2),
  maturity_date DATE NOT NULL,
  status investment_status DEFAULT 'active',
  payment_method payment_method NOT NULL,
  transaction_id VARCHAR(100),
  nft_token_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id UUID REFERENCES sag_investments(id),
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date TIMESTAMP DEFAULT NOW(),
  payment_method payment_method NOT NULL,
  external_transaction_id VARCHAR(100),
  status transaction_status DEFAULT 'pending',
  blockchain_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## 7. Payment Processing Module

### 7.1 Payment Methods Interface

#### Frontend Fields (components/payment/payment-methods.tsx)
\`\`\`typescript
interface PaymentForm {
  loanId: string                  // Required, dropdown selection
  paymentAmount: number           // Required, min payment validation
  paymentMethod: 'hedera' | 'bank' | 'card'  // Required, radio selection
  
  // Hedera Wallet Payment
  walletAddress?: string          // Auto-filled if connected
  hbarBalance?: number           // Readonly, fetched from wallet
  
  // Bank Transfer Payment
  bankDetails?: {
    accountName: string          // Required for bank transfer
    accountNumber: string        // Required, validated format
    bankName: string            // Required, dropdown selection
    referenceNumber?: string     // Optional, for tracking
  }
  
  // Card Payment
  cardDetails?: {
    cardNumber: string          // Required, Luhn algorithm validation
    expiryDate: string         // Required, MM/YY format
    cvv: string               // Required, 3-4 digits
    cardHolderName: string    // Required, matches account name
    billingAddress?: {
      address: string
      city: string
      postalCode: string
      country: string
    }
  }
  
  // Payment scheduling
  isScheduled: boolean           // Optional, for future payments
  scheduledDate?: string         // Required if isScheduled
  isRecurring: boolean          // Optional, for auto-payments
  recurringFrequency?: 'monthly' | 'biweekly'  // Required if isRecurring
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/payments/process
interface PaymentProcessRequest {
  loanId: string
  paymentAmount: number
  paymentMethod: string
  paymentDetails: EncryptedPaymentDetails
  scheduledDate?: string
  isRecurring?: boolean
  recurringFrequency?: string
}

interface PaymentProcessResponse {
  success: boolean
  paymentId: string
  transactionId: string
  status: 'completed' | 'pending' | 'failed'
  confirmationNumber: string
  receiptUrl: string
  nextPaymentDue?: {
    amount: number
    dueDate: string
  }
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id),
  payer_id UUID REFERENCES users(id),
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  scheduled_date TIMESTAMP,
  status payment_status DEFAULT 'pending',
  transaction_id VARCHAR(100) UNIQUE,
  external_reference VARCHAR(100),
  confirmation_number VARCHAR(50),
  receipt_url VARCHAR(500),
  processing_fee DECIMAL(8,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MYR',
  exchange_rate DECIMAL(10,6),
  blockchain_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  method_type payment_method NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Encrypted payment details
  encrypted_details JSONB NOT NULL,
  
  -- Metadata
  nickname VARCHAR(50),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recurring_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id),
  payer_id UUID REFERENCES users(id),
  payment_method_id UUID REFERENCES payment_methods(id),
  amount DECIMAL(12,2) NOT NULL,
  frequency recurring_frequency NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  next_payment_date DATE NOT NULL,
  status recurring_status DEFAULT 'active',
  failure_count INTEGER DEFAULT 0,
  max_failures INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 7.2 Payment History Interface

#### Frontend Fields (components/payment/payment-history.tsx)
\`\`\`typescript
interface PaymentHistoryFilters {
  loanFilter: string              // Dropdown, 'all' or specific loan ID
  statusFilter: string            // Dropdown, 'all', 'completed', 'pending', 'failed'
  dateRange: {
    startDate: string            // Date picker
    endDate: string              // Date picker
  }
  amountRange: {
    minAmount: number            // Number input
    maxAmount: number            // Number input
  }
  paymentMethod: string          // Dropdown filter
  searchQuery: string            // Text search across multiple fields
}

interface PaymentHistoryItem {
  id: string
  loanId: string
  loanTitle: string
  paymentDate: string
  amount: number
  method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  transactionId: string
  confirmationNumber: string
  receiptUrl?: string
  processingFee: number
  netAmount: number
  failureReason?: string
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: GET /api/payments/history
interface PaymentHistoryRequest {
  userId: string
  loanId?: string
  status?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  paymentMethod?: string
  search?: string
  page: number
  limit: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  summary: {
    totalPaid: number
    totalPending: number
    totalFailed: number
    averagePayment: number
  }
}
\`\`\`

---

## 8. Wallet Integration Module

### 8.1 Hedera Wallet Connection

#### Frontend Fields (components/apply/wallet-connection.tsx)
\`\`\`typescript
interface WalletConnectionForm {
  connectionMethod: 'hedera' | 'bank'     // Required, radio selection
  
  // Hedera Wallet Details
  walletType?: 'hashpack' | 'blade' | 'kabila'  // Required for Hedera
  walletAddress?: string                   // Auto-filled after connection
  accountId?: string                      // Hedera account ID format (0.0.xxxxx)
  publicKey?: string                      // Wallet public key
  
  // Bank Account Details (alternative)
  bankAccount?: {
    accountName: string                   // Required, account holder name
    accountNumber: string                 // Required, bank account number
    bankName: string                     // Required, dropdown selection
    bankCode: string                     // Auto-filled based on bank
    branchCode?: string                  // Optional, for specific branches
  }
  
  // Verification
  isVerified: boolean                     // Readonly, verification status
  verificationMethod: string              // Readonly, how verification was done
  verificationDate?: string               // Readonly, when verified
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/wallet/connect
interface WalletConnectionRequest {
  userId: string
  walletType: string
  accountId: string
  publicKey: string
  signature: string  // Signed message for verification
  connectionMethod: string
}

interface WalletConnectionResponse {
  success: boolean
  walletId: string
  accountId: string
  balance: {
    hbar: number
    tokens: TokenBalance[]
  }
  isVerified: boolean
  verificationRequired: boolean
}

// API Endpoint: GET /api/wallet/balance
interface WalletBalanceRequest {
  accountId: string
}

interface WalletBalanceResponse {
  accountId: string
  hbarBalance: number
  tokenBalances: TokenBalance[]
  lastUpdated: string
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_type wallet_type NOT NULL,
  account_id VARCHAR(50) NOT NULL,  -- Hedera format: 0.0.xxxxx
  public_key VARCHAR(200) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verification_date TIMESTAMP,
  last_balance_check TIMESTAMP,
  status wallet_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, account_id)
);

CREATE TABLE wallet_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES user_wallets(id),
  hbar_balance DECIMAL(18,8) NOT NULL,
  token_balances JSONB,  -- Array of token balances
  balance_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES user_wallets(id),
  transaction_id VARCHAR(100) NOT NULL,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  token_id VARCHAR(50),  -- For token transactions
  from_account VARCHAR(50),
  to_account VARCHAR(50),
  memo TEXT,
  consensus_timestamp TIMESTAMP,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 8.2 Bank Account Integration

#### Frontend Fields
\`\`\`typescript
interface BankAccountForm {
  accountHolderName: string       // Required, must match KYC name
  accountNumber: string           // Required, bank-specific validation
  bankName: string               // Required, dropdown from supported banks
  bankCode: string               // Auto-filled, SWIFT/routing code
  branchName?: string            // Optional, specific branch
  branchCode?: string            // Optional, branch identifier
  accountType: 'savings' | 'current'  // Required, radio selection
  currency: string               // Default MYR, readonly for now
  
  // Verification
  verificationDocument?: File     // Optional, bank statement/void cheque
  isJointAccount: boolean        // Required, checkbox
  jointAccountHolders?: string[] // Required if joint account
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/bank-account/add
interface BankAccountRequest {
  userId: string
  accountHolderName: string
  accountNumber: string
  bankName: string
  bankCode: string
  branchName?: string
  branchCode?: string
  accountType: string
  currency: string
  isJointAccount: boolean
  jointAccountHolders?: string[]
}

// API Endpoint: POST /api/bank-account/verify
interface BankAccountVerificationRequest {
  bankAccountId: string
  verificationMethod: 'micro_deposit' | 'document' | 'instant'
  verificationData: any
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  account_holder_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_code VARCHAR(20) NOT NULL,
  branch_name VARCHAR(100),
  branch_code VARCHAR(20),
  account_type account_type NOT NULL,
  currency VARCHAR(3) DEFAULT 'MYR',
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(50),
  verification_date TIMESTAMP,
  is_joint_account BOOLEAN DEFAULT FALSE,
  joint_account_holders TEXT[],
  status account_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, account_number, bank_code)
);
\`\`\`

---

## 9. Dashboard Modules

### 9.1 User Dashboard

#### Frontend Components (app/dashboard/page.tsx)
\`\`\`typescript
interface UserDashboardData {
  // User Profile Summary
  userProfile: {
    name: string
    email: string
    kycStatus: 'pending' | 'approved' | 'rejected'
    walletConnected: boolean
    accountBalance: number
    memberSince: string
  }
  
  // Investment Summary
  investmentSummary: {
    totalInvested: number
    currentValue: number
    totalReturns: number
    activeInvestments: number
    completedInvestments: number
    averageReturn: number
  }
  
  // Active Loans (if user has loans)
  activeLoans: {
    loanId: string
    jewelryType: string
    loanAmount: number
    remainingBalance: number
    nextPaymentDate: string
    nextPaymentAmount: number
    status: string
  }[]
  
  // Recent Activity
  recentActivity: {
    id: string
    type: 'investment' | 'payment' | 'return' | 'kyc'
    description: string
    amount?: number
    date: string
    status: string
  }[]
  
  // Investment Opportunities
  availableSAGs: {
    sagId: string
    title: string
    targetAmount: number
    raisedAmount: number
    expectedReturn: number
    duration: number
    riskLevel: string
    minInvestment: number
  }[]
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: GET /api/dashboard/user
interface UserDashboardRequest {
  userId: string
  includeActivity?: boolean
  includeOpportunities?: boolean
  activityLimit?: number
}

interface UserDashboardResponse {
  profile: UserProfile
  investments: InvestmentSummary
  loans: LoanSummary[]
  activity: ActivityItem[]
  opportunities: SAGOpportunity[]
  notifications: NotificationItem[]
}
\`\`\`

### 9.2 Admin Dashboard

#### Frontend Components (app/admin/dashboard/page.tsx)
\`\`\`typescript
interface AdminDashboardData {
  // Platform Statistics
  platformStats: {
    totalUsers: number
    activeUsers: number
    totalSAGs: number
    activeSAGs: number
    totalInvestments: number
    totalVolume: number
    averageROI: number
    platformFees: number
  }
  
  // KYC Management
  kycStats: {
    pendingApplications: number
    approvedToday: number
    rejectedToday: number
    averageProcessingTime: number
    complianceScore: number
  }
  
  // SAG Management
  sagStats: {
    pendingApproval: number
    activeListings: number
    completedSAGs: number
    defaultedSAGs: number
    totalRaised: number
    averageFillRate: number
  }
  
  // Risk Monitoring
  riskMetrics: {
    highRiskUsers: number
    suspiciousTransactions: number
    complianceAlerts: number
    systemHealth: number
    blockchainStatus: string
  }
  
  // Financial Overview
  financialMetrics: {
    dailyVolume: number
    monthlyRevenue: number
    outstandingLoans: number
    liquidityRatio: number
    reserveFunds: number
  }
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: GET /api/admin/dashboard
interface AdminDashboardRequest {
  adminId: string
  dateRange?: {
    startDate: string
    endDate: string
  }
  includeRealtime?: boolean
}

interface AdminDashboardResponse {
  stats: PlatformStatistics
  kyc: KYCMetrics
  sag: SAGMetrics
  risk: RiskMetrics
  financial: FinancialMetrics
  alerts: AlertItem[]
  systemStatus: SystemStatus
}
\`\`\`

### 9.3 CEO Dashboard

#### Frontend Components (app/ceo/dashboard/page.tsx)
\`\`\`typescript
interface CEODashboardData {
  // Executive Summary
  executiveSummary: {
    totalRevenue: number
    monthlyGrowth: number
    userGrowth: number
    marketShare: number
    profitMargin: number
    burnRate: number
  }
  
  // Business Metrics
  businessMetrics: {
    customerAcquisitionCost: number
    lifetimeValue: number
    churnRate: number
    retentionRate: number
    nps: number
    satisfactionScore: number
  }
  
  // Operational Metrics
  operationalMetrics: {
    processingTime: number
    systemUptime: number
    errorRate: number
    supportTickets: number
    complianceScore: number
    auditStatus: string
  }
  
  // Financial Performance
  financialPerformance: {
    revenue: TimeSeriesData[]
    expenses: TimeSeriesData[]
    profit: TimeSeriesData[]
    cashFlow: TimeSeriesData[]
    reserves: number
    projectedGrowth: number
  }
  
  // Strategic Insights
  strategicInsights: {
    marketTrends: TrendData[]
    competitorAnalysis: CompetitorData[]
    riskAssessment: RiskData[]
    opportunities: OpportunityData[]
  }
}
\`\`\`

---

## 10. AI Risk & Compliance Module

### 10.1 KYC/AML Intelligence

#### Frontend Interface (components/ai-risk-compliance/kyc-aml-intelligence.tsx)
\`\`\`typescript
interface KYCAMLDashboard {
  // Risk Scoring
  riskScoring: {
    userId: string
    overallRiskScore: number
    riskFactors: {
      identityVerification: number
      documentAuthenticity: number
      behavioralAnalysis: number
      transactionPatterns: number
      geographicRisk: number
      pep: boolean  // Politically Exposed Person
      sanctions: boolean
      adverseMedia: boolean
    }
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastAssessment: string
    nextReview: string
  }
  
  // AML Monitoring
  amlMonitoring: {
    transactionMonitoring: {
      suspiciousTransactions: number
      flaggedPatterns: string[]
      velocityAlerts: number
      amountThresholdBreaches: number
    }
    watchlistScreening: {
      sanctionsHits: number
      pepMatches: number
      adverseMediaHits: number
      lastScreening: string
    }
    reportingStatus: {
      sarsFiled: number  // Suspicious Activity Reports
      ctrsFiled: number  // Currency Transaction Reports
      pendingReports: number
      complianceScore: number
    }
  }
  
  // AI Insights
  aiInsights: {
    riskPredictions: {
      defaultProbability: number
      fraudRisk: number
      complianceRisk: number
      confidenceLevel: number
    }
    recommendations: {
      action: string
      priority: 'low' | 'medium' | 'high'
      reasoning: string
      estimatedImpact: string
    }[]
    modelPerformance: {
      accuracy: number
      precision: number
      recall: number
      lastTraining: string
    }
  }
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/ai/kyc-risk-assessment
interface KYCRiskAssessmentRequest {
  userId: string
  assessmentType: 'initial' | 'periodic' | 'triggered'
  triggerReason?: string
}

interface KYCRiskAssessmentResponse {
  assessmentId: string
  riskScore: number
  riskLevel: string
  riskFactors: RiskFactor[]
  recommendations: Recommendation[]
  requiresManualReview: boolean
  nextReviewDate: string
}

// API Endpoint: POST /api/ai/aml-screening
interface AMLScreeningRequest {
  userId: string
  screeningType: 'sanctions' | 'pep' | 'adverse_media' | 'comprehensive'
  forceRefresh?: boolean
}

interface AMLScreeningResponse {
  screeningId: string
  matches: ScreeningMatch[]
  riskScore: number
  requiresInvestigation: boolean
  lastScreened: string
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  assessment_type assessment_type NOT NULL,
  overall_risk_score DECIMAL(5,2) NOT NULL,
  risk_level risk_level NOT NULL,
  risk_factors JSONB NOT NULL,
  ai_model_version VARCHAR(20) NOT NULL,
  assessment_date TIMESTAMP DEFAULT NOW(),
  next_review_date DATE,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  status assessment_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aml_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  screening_type screening_type NOT NULL,
  screening_date TIMESTAMP DEFAULT NOW(),
  matches JSONB,  -- Array of screening matches
  risk_score DECIMAL(5,2),
  requires_investigation BOOLEAN DEFAULT FALSE,
  investigation_status investigation_status DEFAULT 'none',
  investigated_by UUID REFERENCES users(id),
  investigation_notes TEXT,
  cleared_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type report_type NOT NULL,
  user_id UUID REFERENCES users(id),
  transaction_id UUID,
  report_data JSONB NOT NULL,
  filed_date TIMESTAMP DEFAULT NOW(),
  filed_by UUID REFERENCES users(id),
  regulatory_reference VARCHAR(100),
  status report_status DEFAULT 'filed',
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 10.2 SAG Risk Evaluation

#### Frontend Interface (components/ai-risk-compliance/sag-risk-evaluation.tsx)
\`\`\`typescript
interface SAGRiskEvaluation {
  // Borrower Risk Assessment
  borrowerRisk: {
    creditScore: number
    paymentHistory: {
      onTimePayments: number
      latePayments: number
      defaults: number
      averageDelay: number
    }
    financialStability: {
      incomeVerification: boolean
      employmentStatus: string
      debtToIncomeRatio: number
      bankStatements: boolean
    }
    behavioralRisk: {
      applicationConsistency: number
      documentAuthenticity: number
      communicationPattern: number
    }
  }
  
  // Collateral Risk Assessment
  collateralRisk: {
    jewelryValuation: {
      assessedValue: number
      marketValue: number
      liquidityScore: number
      volatilityRisk: number
    }
    physicalCondition: {
      conditionScore: number
      authenticityScore: number
      marketabilityScore: number
    }
    storageRisk: {
      securityLevel: number
      insuranceCoverage: number
      locationRisk: number
    }
  }
  
  // Market Risk Factors
  marketRisk: {
    goldPriceVolatility: number
    marketLiquidity: number
    economicIndicators: {
      inflationRate: number
      interestRates: number
      currencyStability: number
    }
    seasonalFactors: number
  }
  
  // Overall SAG Risk
  overallRisk: {
    riskScore: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    recommendedAction: string
    maxLoanAmount: number
    recommendedRate: number
    riskMitigations: string[]
  }
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/ai/sag-risk-evaluation
interface SAGRiskEvaluationRequest {
  sagId: string
  borrowerId: string
  jewelryId: string
  loanAmount: number
  loanDuration: number
  evaluationType: 'initial' | 'periodic' | 'pre_approval'
}

interface SAGRiskEvaluationResponse {
  evaluationId: string
  overallRiskScore: number
  riskLevel: string
  borrowerRisk: BorrowerRiskData
  collateralRisk: CollateralRiskData
  marketRisk: MarketRiskData
  recommendations: RiskRecommendation[]
  approvalRecommendation: 'approve' | 'reject' | 'manual_review'
  maxRecommendedAmount: number
  recommendedRate: number
}
\`\`\`

---

## 11. Notification System

### 11.1 Notification Management

#### Frontend Interface
\`\`\`typescript
interface NotificationSystem {
  // Notification Preferences
  preferences: {
    email: {
      enabled: boolean
      frequency: 'immediate' | 'daily' | 'weekly'
      types: NotificationType[]
    }
    sms: {
      enabled: boolean
      types: NotificationType[]
    }
    push: {
      enabled: boolean
      types: NotificationType[]
    }
    inApp: {
      enabled: boolean
      types: NotificationType[]
    }
  }
  
  // Notification Types
  notificationTypes: {
    kyc: ['approved', 'rejected', 'additional_docs_required']
    investments: ['opportunity_available', 'investment_confirmed', 'return_received']
    payments: ['payment_due', 'payment_received', 'payment_failed']
    sag: ['sag_approved', 'sag_funded', 'sag_matured']
    security: ['login_detected', 'password_changed', 'suspicious_activity']
    system: ['maintenance', 'feature_updates', 'policy_changes']
  }
  
  // Notification History
  notifications: {
    id: string
    type: string
    title: string
    message: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    read: boolean
    actionRequired: boolean
    actionUrl?: string
    createdAt: string
    readAt?: string
  }[]
}
\`\`\`

#### Backend Implementation
\`\`\`typescript
// API Endpoint: POST /api/notifications/send
interface NotificationRequest {
  userId: string | string[]
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: ('email' | 'sms' | 'push' | 'in_app')[]
  actionUrl?: string
  scheduledFor?: string
  expiresAt?: string
  metadata?: any
}

// API Endpoint: GET /api/notifications/user
interface UserNotificationsRequest {
  userId: string
  unreadOnly?: boolean
  types?: string[]
  limit?: number
  offset?: number
}
\`\`\`

#### Database Schema
\`\`\`sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority notification_priority DEFAULT 'medium',
  channels notification_channel[] NOT NULL,
  action_url VARCHAR(500),
  metadata JSONB,
  scheduled_for TIMESTAMP,
  expires_at TIMESTAMP,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  status notification_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_frequency notification_frequency DEFAULT 'immediate',
  enabled_types notification_type[] DEFAULT ARRAY['kyc', 'investments', 'payments'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## 12. API Specifications

### 12.1 Authentication APIs

\`\`\`typescript
// Authentication Endpoints
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email
POST /api/auth/resend-verification

// Authorization Middleware
interface AuthMiddleware {
  requireAuth: (req, res, next) => void
  requireRole: (roles: string[]) => (req, res, next) => void
  requireKYC: (req, res, next) => void
  requireWallet: (req, res, next) => void
}
\`\`\`

### 12.2 User Management APIs

\`\`\`typescript
// User Management Endpoints
GET /api/users/profile
PUT /api/users/profile
DELETE /api/users/account
GET /api/users/preferences
PUT /api/users/preferences
POST /api/users/change-password
GET /api/users/activity-log
POST /api/users/deactivate

// Admin User Management
GET /api/admin/users
POST /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
POST /api/admin/users/:id/suspend
POST /api/admin/users/:id/activate
\`\`\`

### 12.3 KYC APIs

\`\`\`typescript
// KYC Management Endpoints
POST /api/kyc/start-application
PUT /api/kyc/personal-info
POST /api/kyc/upload-document
PUT /api/kyc/id-verification
POST /api/kyc/facial-verification
POST /api/kyc/submit-application
GET /api/kyc/status
GET /api/kyc/application/:id

// Admin KYC Management
GET /api/admin/kyc/applications
PUT /api/admin/kyc/applications/:id/approve
PUT /api/admin/kyc/applications/:id/reject
GET /api/admin/kyc/statistics
POST /api/admin/kyc/bulk-approve
\`\`\`

### 12.4 SAG Management APIs

\`\`\`typescript
// SAG Endpoints
GET /api/sag/listings
GET /api/sag/listings/:id
POST /api/sag/create
PUT /api/sag/update/:id
DELETE /api/sag/delete/:id
POST /api/sag/invest
GET /api/sag/my-investments
POST /api/sag/withdraw-investment

// Admin SAG Management
GET /api/admin/sag/pending-approval
PUT /api/admin/sag/approve/:id
PUT /api/admin/sag/reject/:id
GET /api/admin/sag/statistics
POST /api/admin/sag/bulk-operations
\`\`\`

### 12.5 Payment APIs

\`\`\`typescript
// Payment Processing Endpoints
POST /api/payments/process
GET /api/payments/history
GET /api/payments/methods
POST /api/payments/methods/add
DELETE /api/payments/methods/:id
POST /api/payments/schedule
GET /api/payments/recurring
PUT /api/payments/recurring/:id
DELETE /api/payments/recurring/:id

// Payment Webhooks
POST /api/webhooks/payment-success
POST /api/webhooks/payment-failed
POST /api/webhooks/payment-pending
\`\`\`

### 12.6 Blockchain Integration APIs

\`\`\`typescript
// Hedera Integration Endpoints
POST /api/blockchain/connect-wallet
GET /api/blockchain/wallet-balance
POST /api/blockchain/create-nft
POST /api/blockchain/transfer-token
GET /api/blockchain/transaction-status
POST /api/blockchain/smart-contract/execute
GET /api/blockchain/smart-contract/query

// Token Management (Admin)
POST /api/admin/blockchain/mint-token
POST /api/admin/blockchain/burn-token
GET /api/admin/blockchain/token-supply
POST /api/admin/blockchain/freeze-account
POST /api/admin/blockchain/unfreeze-account
\`\`\`

---

## 13. Database Schema Mapping

### 13.1 Complete Entity Relationship Diagram

\`\`\`sql
-- Core User Management
CREATE TYPE user_role AS ENUM ('user', 'investor', 'ar_rahnu', 'branch_manager', 'admin', 'ceo');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

-- KYC and Compliance
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE document_type AS ENUM ('id_front', 'id_back', 'selfie', 'bank_statement', 'certificate');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'failed', 'expired');

-- Jewelry and SAG Management
CREATE TYPE jewelry_type AS ENUM ('gold', 'silver', 'diamond', 'platinum');
CREATE TYPE jewelry_condition AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE sag_status AS ENUM ('draft', 'pending_approval', 'active', 'funded', 'completed', 'defaulted');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Financial and Payment
CREATE TYPE payment_method AS ENUM ('hedera', 'bank_transfer', 'credit_card', 'debit_card');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE transaction_type AS ENUM ('investment', 'payment', 'withdrawal', 'fee', 'return');
CREATE TYPE investment_status AS ENUM ('active', 'matured', 'withdrawn', 'defaulted');

-- Notifications and System
CREATE TYPE notification_type AS ENUM ('kyc', 'investment', 'payment', 'sag', 'security', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');
\`\`\`

### 13.2 Table Relationships and Constraints

\`\`\`sql
-- Foreign Key Relationships
ALTER TABLE kyc_applications ADD CONSTRAINT fk_kyc_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sag_investments ADD CONSTRAINT fk_investment_user 
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE sag_investments ADD CONSTRAINT fk_investment_sag 
  FOREIGN KEY (sag_id) REFERENCES sag_listings(id) ON DELETE RESTRICT;

ALTER TABLE payments ADD CONSTRAINT fk_payment_loan 
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT;

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_kyc_status ON kyc_applications(status);
CREATE INDEX idx_sag_status ON sag_listings(status);
CREATE INDEX idx_payments_user_date ON payments(payer_id, payment_date);
CREATE INDEX idx_investments_user ON sag_investments(investor_id);

-- Triggers for Audit Trail
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### 13.3 Data Validation Rules

\`\`\`sql
-- Check Constraints
ALTER TABLE users ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE sag_listings ADD CONSTRAINT check_raise_percentage 
  CHECK (raise_percentage > 0 AND raise_percentage <= 80);

ALTER TABLE jewelry_items ADD CONSTRAINT check_weight_positive 
  CHECK (weight > 0);

ALTER TABLE payments ADD CONSTRAINT check_amount_positive 
  CHECK (payment_amount > 0);

-- Business Logic Constraints
ALTER TABLE sag_investments ADD CONSTRAINT check_investment_amount 
  CHECK (investment_amount >= minimum_investment);

ALTER TABLE kyc_applications ADD CONSTRAINT check_review_logic 
  CHECK ((status = 'approved' AND reviewed_by IS NOT NULL) OR 
         (status = 'rejected' AND reviewed_by IS NOT NULL AND rejection_reason IS NOT NULL) OR 
         (status IN ('pending', 'under_review')));
\`\`\`

---

## 14. Security and Compliance Requirements

### 14.1 Data Protection and Privacy

\`\`\`typescript
// Data Encryption Standards
interface EncryptionStandards {
  atRest: {
    algorithm: 'AES-256-GCM'
    keyManagement: 'AWS KMS'
    fields: [
      'users.password_hash',
      'payment_methods.encrypted_details',
      'kyc_documents.file_path',
      'user_wallets.private_key_encrypted'
    ]
  }
  
  inTransit: {
    protocol: 'TLS 1.3'
    certificateAuthority: 'Let\'s Encrypt'
    hsts: true
    perfectForwardSecrecy: true
  }
  
  applicationLevel: {
    sensitiveFields: [
      'ic_number',
      'phone',
      'address',
      'account_number',
      'wallet_private_key'
    ]
    hashingAlgorithm: 'bcrypt'
    saltRounds: 12
  }
}
\`\`\`

### 14.2 Access Control Matrix

\`\`\`typescript
interface AccessControlMatrix {
  roles: {
    user: {
      permissions: [
        'read:own_profile',
        'update:own_profile',
        'create:kyc_application',
        'read:own_kyc',
        'create:jewelry_submission',
        'read:own_investments',
        'create:investment',
        'read:sag_listings',
        'create:payment',
        'read:own_payments'
      ]
    }
    
    ar_rahnu: {
      inherits: ['user']
      permissions: [
        'create:sag_listing',
        'read:branch_sags',
        'update:branch_sags',
        'read:branch_borrowers',
        'create:borrower',
        'update:borrower'
      ]
    }
    
    admin: {
      permissions: [
        'read:all_users',
        'update:user_status',
        'read:all_kyc',
        'approve:kyc_application',
        'reject:kyc_application',
        'read:all_sags',
        'approve:sag_listing',
        'read:all_payments',
        'read:system_metrics',
        'manage:compliance'
      ]
    }
    
    ceo: {
      inherits: ['admin']
      permissions: [
        'read:financial_reports',
        'read:executive_dashboard',
        'manage:system_settings',
        'access:audit_logs'
      ]
    }
  }
}
\`\`\`

### 14.3 Compliance Monitoring

\`\`\`typescript
interface ComplianceMonitoring {
  amlCompliance: {
    transactionMonitoring: {
      thresholds: {
        singleTransaction: 10000  // MYR
        dailyAggregate: 50000     // MYR
        monthlyAggregate: 500000  // MYR
      }
      
      suspiciousPatterns: [
        'rapid_succession_transactions',
        'round_number_transactions',
        'unusual_timing_patterns',
        'geographic_anomalies',
        'velocity_anomalies'
      ]
      
      reportingRequirements: {
        sar: 'within_24_hours'  // Suspicious Activity Report
        ctr: 'within_15_days'   // Currency Transaction Report
        str: 'within_15_days'   // Suspicious Transaction Report
      }
    }
    
    kycCompliance: {
      verificationLevels: {
        basic: {
          requirements: ['identity_document', 'address_proof']
          transactionLimit: 1000  // MYR
        }
        enhanced: {
          requirements: ['identity_document', 'address_proof', 'income_proof', 'facial_verification']
          transactionLimit: 50000  // MYR
        }
        premium: {
          requirements: ['enhanced_requirements', 'source_of_funds', 'enhanced_due_diligence']
          transactionLimit: 'unlimited'
        }
      }
      
      riskCategories: {
        low: {
          reviewFrequency: 'annual'
          additionalChecks: false
        }
        medium: {
          reviewFrequency: 'semi_annual'
          additionalChecks: true
        }
        high: {
          reviewFrequency: 'quarterly'
          additionalChecks: true
          manualReview: true
        }
      }
    }
    
    shariahCompliance: {
      principles: [
        'no_interest_based_transactions',
        'asset_backed_financing',
        'risk_sharing_model',
        'transparent_pricing',
        'ethical_investment_screening'
      ]
      
      auditRequirements: {
        frequency: 'quarterly'
        auditor: 'certified_shariah_advisor'
        reportingTo: 'shariah_supervisory_board'
      }
      
      prohibitedActivities: [
        'gambling',
        'alcohol',
        'tobacco',
        'weapons',
        'adult_entertainment',
        'conventional_banking_interest'
      ]
    }
  }
}
\`\`\`

### 14.4 Audit Trail and Logging

\`\`\`typescript
interface AuditTrailSystem {
  auditEvents: {
    authentication: [
      'user_login',
      'user_logout',
      'failed_login_attempt',
      'password_change',
      'account_lockout'
    ]
    
    dataAccess: [
      'profile_view',
      'profile_update',
      'sensitive_data_access',
      'bulk_data_export',
      'admin_data_access'
    ]
    
    transactions: [
      'investment_created',
      'payment_processed',
      'sag_created',
      'sag_approved',
      'kyc_status_change'
    ]
    
    systemEvents: [
      'configuration_change',
      'user_role_change',
      'system_maintenance',
      'backup_created',
      'security_alert'
    ]
  }
  
  logFormat: {
    timestamp: 'ISO8601'
    userId: 'UUID'
    sessionId: 'UUID'
    eventType: 'string'
    eventDetails: 'JSON'
    ipAddress: 'string'
    userAgent: 'string'
    outcome: 'success | failure | pending'
    riskScore?: 'number'
  }
  
  retention: {
    auditLogs: '7_years'
    transactionLogs: '10_years'
    securityLogs: '5_years'
    systemLogs: '2_years'
  }
  
  monitoring: {
    realTimeAlerts: [
      'multiple_failed_logins',
      'privilege_escalation',
      'unusual_data_access',
      'system_intrusion_attempt',
      'data_breach_indicators'
    ]
    
    reportingSchedule: {
      daily: 'security_summary'
      weekly: 'compliance_report'
      monthly: 'audit_summary'
      quarterly: 'risk_assessment'
    }
  }
}
\`\`\`

---

## 15. Performance and Scalability Requirements

### 15.1 Performance Benchmarks

\`\`\`typescript
interface PerformanceRequirements {
  responseTime: {
    api: {
      authentication: '< 200ms'
      dataRetrieval: '< 500ms'
      dataUpdate: '< 1000ms'
      complexQueries: '< 2000ms'
      fileUpload: '< 5000ms'
    }
    
    frontend: {
      pageLoad: '< 2000ms'
      componentRender: '< 100ms'
      userInteraction: '< 50ms'
      searchResults: '< 1000ms'
    }
    
    blockchain: {
      walletConnection: '< 3000ms'
      transactionSubmission: '< 5000ms'
      transactionConfirmation: '< 30000ms'
      balanceQuery: '< 2000ms'
    }
  }
  
  throughput: {
    concurrent_users: 10000
    transactions_per_second: 1000
    api_requests_per_minute: 100000
    file_uploads_per_hour: 5000
  }
  
  availability: {
    uptime: '99.9%'
    planned_maintenance: '< 4_hours_monthly'
    disaster_recovery_time: '< 4_hours'
    data_backup_frequency: 'every_6_hours'
  }
}
\`\`\`

### 15.2 Scalability Architecture

\`\`\`typescript
interface ScalabilityDesign {
  horizontalScaling: {
    webServers: {
      loadBalancer: 'AWS_ALB'
      autoScaling: {
        minInstances: 2
        maxInstances: 20
        scaleUpThreshold: '70%_cpu'
        scaleDownThreshold: '30%_cpu'
      }
    }
    
    apiServers: {
      containerization: 'Docker'
      orchestration: 'Kubernetes'
      replicaSet: {
        minimum: 3
        maximum: 50
        targetCPU: '60%'
        targetMemory: '70%'
      }
    }
    
    database: {
      readReplicas: 3
      sharding: 'user_id_based'
      connectionPooling: {
        maxConnections: 100
        idleTimeout: '10_minutes'
      }
    }
  }
  
  caching: {
    redis: {
      sessionStorage: '15_minutes_ttl'
      apiResponses: '5_minutes_ttl'
      userProfiles: '1_hour_ttl'
      sagListings: '10_minutes_ttl'
    }
    
    cdn: {
      staticAssets: 'CloudFlare'
      imageOptimization: true
      gzipCompression: true
      cacheHeaders: 'max_age_1_year'
    }
  }
  
  monitoring: {
    metrics: [
      'response_time',
      'error_rate',
      'throughput',
      'resource_utilization',
      'user_satisfaction'
    ]
    
    alerting: {
      responseTime: '> 2000ms'
      errorRate: '> 1%'
      cpuUsage: '> 80%'
      memoryUsage: '> 85%'
      diskUsage: '> 90%'
    }
  }
}
\`\`\`

---

## 16. Testing Strategy and Quality Assurance

### 16.1 Testing Framework

\`\`\`typescript
interface TestingStrategy {
  unitTesting: {
    framework: 'Jest'
    coverage: '> 90%'
    testTypes: [
      'component_testing',
      'function_testing',
      'service_testing',
      'utility_testing'
    ]
    
    mockingStrategy: {
      externalAPIs: 'mock_all'
      database: 'in_memory_db'
      blockchain: 'test_network'
      fileSystem: 'virtual_fs'
    }
  }
  
  integrationTesting: {
    framework: 'Cypress'
    testEnvironments: ['staging', 'pre_production']
    testScenarios: [
      'user_registration_flow',
      'kyc_verification_process',
      'investment_workflow',
      'payment_processing',
      'admin_operations'
    ]
    
    dataManagement: {
      testData: 'synthetic_data'
      dataRefresh: 'before_each_test'
      cleanup: 'after_each_test'
    }
  }
  
  e2eTesting: {
    framework: 'Playwright'
    browsers: ['Chrome', 'Firefox', 'Safari', 'Edge']
    devices: ['Desktop', 'Tablet', 'Mobile']
    
    criticalPaths: [
      'complete_user_onboarding',
      'make_investment',
      'process_payment',
      'admin_approval_workflow',
      'compliance_reporting'
    ]
  }
  
  performanceTesting: {
    tools: ['Artillery', 'K6']
    testTypes: [
      'load_testing',
      'stress_testing',
      'spike_testing',
      'volume_testing',
      'endurance_testing'
    ]
    
    scenarios: {
      normalLoad: '1000_concurrent_users'
      peakLoad: '5000_concurrent_users'
      stressLoad: '10000_concurrent_users'
      duration: '30_minutes'
    }
  }
  
  securityTesting: {
    tools: ['OWASP_ZAP', 'Burp_Suite']
    testTypes: [
      'vulnerability_scanning',
      'penetration_testing',
      'authentication_testing',
      'authorization_testing',
      'input_validation_testing'
    ]
    
    compliance: [
      'OWASP_Top_10',
      'PCI_DSS',
      'ISO_27001',
      'GDPR_compliance'
    ]
  }
}
\`\`\`

---

## 17. Deployment and DevOps

### 17.1 CI/CD Pipeline

\`\`\`typescript
interface CICDPipeline {
  sourceControl: {
    repository: 'GitHub'
    branchingStrategy: 'GitFlow'
    protectedBranches: ['main', 'develop']
    requiredReviews: 2
    statusChecks: [
      'unit_tests',
      'integration_tests',
      'security_scan',
      'code_quality'
    ]
  }
  
  buildPipeline: {
    trigger: 'push_to_develop'
    stages: [
      {
        name: 'code_quality'
        tools: ['ESLint', 'Prettier', 'SonarQube']
        failureAction: 'stop_pipeline'
      },
      {
        name: 'unit_tests'
        coverage: '> 90%'
        failureAction: 'stop_pipeline'
      },
      {
        name: 'security_scan'
        tools: ['Snyk', 'OWASP_Dependency_Check']
        failureAction: 'stop_pipeline'
      },
      {
        name: 'build_artifacts'
        outputs: ['docker_images', 'static_assets']
      }
    ]
  }
  
  deploymentPipeline: {
    environments: {
      development: {
        trigger: 'automatic'
        approvals: 0
        tests: ['smoke_tests']
      }
      
      staging: {
        trigger: 'manual'
        approvals: 1
        tests: ['integration_tests', 'e2e_tests']
      }
      
      production: {
        trigger: 'manual'
        approvals: 2
        tests: ['smoke_tests', 'health_checks']
        strategy: 'blue_green'
        rollbackPlan: 'automatic_on_failure'
      }
    }
  }
  
  monitoring: {
    buildMetrics: [
      'build_success_rate',
      'build_duration',
      'test_coverage',
      'deployment_frequency'
    ]
    
    alerts: [
      'build_failure',
      'deployment_failure',
      'test_coverage_drop',
      'security_vulnerability'
    ]
  }
}
\`\`\`

### 17.2 Infrastructure as Code

\`\`\`typescript
interface InfrastructureAsCode {
  tools: {
    provisioning: 'Terraform'
    configuration: 'Ansible'
    containerization: 'Docker'
    orchestration: 'Kubernetes'
  }
  
  environments: {
    development: {
      instances: {
        web: 1
        api: 2
        database: 1
        redis: 1
      }
      resources: {
        cpu: '2_cores'
        memory: '4GB'
        storage: '50GB'
      }
    }
    
    staging: {
      instances: {
        web: 2
        api: 3
        database: 2
        redis: 2
      }
      resources: {
        cpu: '4_cores'
        memory: '8GB'
        storage: '100GB'
      }
    }
    
    production: {
      instances: {
        web: 5
        api: 10
        database: 3
        redis: 3
      }
      resources: {
        cpu: '8_cores'
        memory: '16GB'
        storage: '500GB'
      }
      
      highAvailability: {
        multiAZ: true
        autoScaling: true
        loadBalancing: true
        backupStrategy: 'cross_region'
      }
    }
  }
}
\`\`\`

---

This comprehensive FRD document provides detailed specifications for every frontend field and its corresponding backend implementation in the Suyula Liquid platform. Each section includes complete field definitions, validation rules, API specifications, database schemas, and business logic requirements to ensure seamless integration between frontend and backend systems while maintaining the existing website functionality.
