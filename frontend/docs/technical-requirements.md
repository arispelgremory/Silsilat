# Suyula Liquid - Technical Requirements & Implementation Guide

## 1. System Requirements

### 1.1 Hardware Requirements

#### Production Environment
- **Web Servers**: 4x AWS EC2 c5.2xlarge instances (8 vCPU, 16GB RAM)
- **Database Server**: AWS RDS PostgreSQL 15 (db.r6g.2xlarge - 8 vCPU, 64GB RAM)
- **Redis Cache**: AWS ElastiCache (cache.r6g.large - 2 vCPU, 13GB RAM)
- **Load Balancer**: AWS Application Load Balancer
- **CDN**: CloudFlare Pro plan
- **Storage**: AWS S3 (Standard + Glacier for archival)

#### Development Environment
- **Local Development**: Docker containers
- **Staging**: 2x AWS EC2 t3.large instances (2 vCPU, 8GB RAM)
- **Testing Database**: AWS RDS PostgreSQL (db.t3.medium)

### 1.2 Software Requirements

#### Core Technologies
- **Runtime**: Node.js 20.x LTS
- **Framework**: Next.js 14.x (App Router)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7.x
- **Message Queue**: Bull Queue with Redis
- **Container**: Docker 24.x, Docker Compose

#### Development Tools
- **IDE**: VS Code with recommended extensions
- **Version Control**: Git with GitHub
- **Package Manager**: npm or yarn
- **Testing**: Jest, Cypress, Playwright
- **Linting**: ESLint, Prettier, Husky

## 2. Development Environment Setup

### 2.1 Prerequisites Installation

\`\`\`bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
node --version  # Should be v20.x.x
docker --version
docker-compose --version
\`\`\`

### 2.2 Project Setup

\`\`\`bash
# Clone repository
git clone https://github.com/suyula-liquid/platform.git
cd platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development services
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
\`\`\`

### 2.3 Environment Variables

\`\`\`bash
# .env.local
# Database
DATABASE_URL="postgresql://suyula:password@localhost:5432/suyula_liquid"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-refresh-token-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="suyula-liquid-dev"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_VISION_API_KEY="your-google-vision-key"

# Payment Gateways
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# Email Service
SENDGRID_API_KEY="SG.your-sendgrid-key"
FROM_EMAIL="noreply@suyulaliquid.com"

# Blockchain
ETHEREUM_RPC_URL="https://mainnet.infura.io/v3/your-project-id"
POLYGON_RPC_URL="https://polygon-rpc.com"
PRIVATE_KEY="your-wallet-private-key"

# External APIs
GOLD_PRICE_API_KEY="your-metals-api-key"
KYC_PROVIDER_API_KEY="your-kyc-provider-key"
AML_SCREENING_API_KEY="your-aml-screening-key"
\`\`\`

## 3. Architecture Implementation

### 3.1 Folder Structure

\`\`\`
suyula-liquid/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/
│   │   ├── apply/
│   │   └── payment/
│   ├── admin/                    # Admin routes
│   │   ├── dashboard/
│   │   ├── loans/
│   │   └── ai-risk-compliance/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── loans/
│   │   ├── jewelry/
│   │   └── admin/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── charts/                   # Chart components
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication logic
│   ├── db.ts                     # Database connection
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod schemas
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                       # Static assets
├── scripts/                      # Build and deployment scripts
├── tests/                        # Test files
│   ├── __tests__/
│   ├── e2e/
│   └── fixtures/
├── docs/                         # Documentation
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
\`\`\`

### 3.2 Database Implementation

#### 3.2.1 Prisma Schema Setup

\`\`\`prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  phone             String?   @unique
  passwordHash      String    @map("password_hash")
  firstName         String    @map("first_name")
  lastName          String    @map("last_name")
  dateOfBirth       DateTime? @map("date_of_birth")
  isEmailVerified   Boolean   @default(false) @map("is_email_verified")
  isPhoneVerified   Boolean   @default(false) @map("is_phone_verified")
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  addresses         UserAddress[]
  roles             UserRole[]
  jewelryItems      JewelryItem[]
  loanApplications  LoanApplication[]
  loans             Loan[]
  investments       Investment[]
  kycVerifications  KycVerification[]

  @@map("users")
}

model JewelryItem {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  name            String
  description     String?
  metalType       String    @map("metal_type")
  metalPurity     String?   @map("metal_purity")
  weightGrams     Decimal?  @map("weight_grams")
  estimatedValue  Decimal?  @map("estimated_value")
  marketValue     Decimal?  @map("market_value")
  status          String    @default("submitted")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  user            User      @relation(fields: [userId], references: [id])
  images          JewelryImage[]
  aiValuations    AiValuation[]
  loanApplications LoanApplication[]

  @@map("jewelry_items")
}

// Additional models would follow similar pattern...
\`\`\`

#### 3.2.2 Database Migration Commands

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed
\`\`\`

### 3.3 API Implementation

#### 3.3.1 Authentication Middleware

\`\`\`typescript
// lib/auth.ts
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

export async function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    throw new Error('Access token required')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map(ur => ur.role.name)
    }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function requireRole(roles: string[]) {
  return (user: any) => {
    if (!user.roles.some((role: string) => roles.includes(role))) {
      throw new Error('Insufficient permissions')
    }
  }
}
\`\`\`

#### 3.3.2 API Route Example

\`\`\`typescript
// app/api/loans/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateToken } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateLoanTerms } from '@/lib/loan-calculator'

const loanApplicationSchema = z.object({
  jewelryItemId: z.string().uuid(),
  loanProductId: z.string().uuid(),
  requestedAmount: z.number().positive(),
  requestedDurationDays: z.number().int().min(30).max(365),
  purpose: z.string().optional(),
  monthlyIncome: z.number().positive().optional(),
  employmentStatus: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateToken(request)
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = loanApplicationSchema.parse(body)

    // Check if jewelry item belongs to user
    const jewelryItem = await prisma.jewelryItem.findFirst({
      where: {
        id: validatedData.jewelryItemId,
        userId: user.id,
        status: 'approved'
      }
    })

    if (!jewelryItem) {
      return NextResponse.json(
        { error: 'Jewelry item not found or not approved' },
        { status: 404 }
      )
    }

    // Get loan product
    const loanProduct = await prisma.loanProduct.findUnique({
      where: { id: validatedData.loanProductId }
    })

    if (!loanProduct || !loanProduct.isActive) {
      return NextResponse.json(
        { error: 'Loan product not available' },
        { status: 404 }
      )
    }

    // Validate loan amount against collateral value
    const maxLoanAmount = jewelryItem.estimatedValue! * loanProduct.maxLtvRatio
    if (validatedData.requestedAmount > maxLoanAmount) {
      return NextResponse.json(
        { error: 'Requested amount exceeds maximum allowed' },
        { status: 400 }
      )
    }

    // Generate application number
    const applicationNumber = `LA${Date.now()}`

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        userId: user.id,
        loanProductId: validatedData.loanProductId,
        jewelryItemId: validatedData.jewelryItemId,
        applicationNumber,
        requestedAmount: validatedData.requestedAmount,
        requestedDurationDays: validatedData.requestedDurationDays,
        purpose: validatedData.purpose,
        monthlyIncome: validatedData.monthlyIncome,
        employmentStatus: validatedData.employmentStatus,
        status: 'submitted',
        submittedAt: new Date()
      },
      include: {
        jewelryItem: true,
        loanProduct: true
      }
    })

    // Trigger AI risk assessment (async)
    // await assessLoanRisk(loanApplication.id)

    return NextResponse.json(loanApplication, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Loan application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
\`\`\`

### 3.4 Frontend Implementation

#### 3.4.1 Custom Hooks

\`\`\`typescript
// hooks/use-loans.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface LoanApplication {
  jewelryItemId: string
  loanProductId: string
  requestedAmount: number
  requestedDurationDays: number
  purpose?: string
  monthlyIncome?: number
  employmentStatus?: string
}

export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const response = await fetch('/api/loans/my-loans')
      if (!response.ok) throw new Error('Failed to fetch loans')
      return response.json()
    }
  })
}

export function useLoanApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoanApplication) => {
      const response = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit application')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      toast.success('Loan application submitted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}
\`\`\`

#### 3.4.2 Form Components

\`\`\`typescript
// components/forms/loan-application-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLoanApplication } from '@/hooks/use-loans'

const loanApplicationSchema = z.object({
  jewelryItemId: z.string().min(1, 'Please select a jewelry item'),
  loanProductId: z.string().min(1, 'Please select a loan product'),
  requestedAmount: z.number().min(100, 'Minimum amount is $100'),
  requestedDurationDays: z.number().min(30, 'Minimum duration is 30 days'),
  purpose: z.string().optional(),
  monthlyIncome: z.number().optional(),
  employmentStatus: z.string().optional()
})

type LoanApplicationForm = z.infer<typeof loanApplicationSchema>

interface Props {
  jewelryItems: Array<{ id: string; name: string; estimatedValue: number }>
  loanProducts: Array<{ id: string; name: string; maxLtvRatio: number }>
}

export function LoanApplicationForm({ jewelryItems, loanProducts }: Props) {
  const [selectedJewelry, setSelectedJewelry] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  
  const loanApplication = useLoanApplication()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoanApplicationForm>({
    resolver: zodResolver(loanApplicationSchema)
  })

  const requestedAmount = watch('requestedAmount')
  
  // Calculate maximum loan amount based on selected jewelry and product
  const maxLoanAmount = React.useMemo(() => {
    if (!selectedJewelry || !selectedProduct) return 0
    
    const jewelry = jewelryItems.find(item => item.id === selectedJewelry)
    const product = loanProducts.find(prod => prod.id === selectedProduct)
    
    if (!jewelry || !product) return 0
    
    return jewelry.estimatedValue * product.maxLtvRatio
  }, [selectedJewelry, selectedProduct, jewelryItems, loanProducts])

  const onSubmit = async (data: LoanApplicationForm) => {
    try {
      await loanApplication.mutateAsync(data)
    } catch (error) {
      // Error handling is done in the mutation
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jewelryItemId">Select Jewelry Item</Label>
        <Select
          value={selectedJewelry}
          onValueChange={(value) => {
            setSelectedJewelry(value)
            setValue('jewelryItemId', value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose jewelry item" />
          </SelectTrigger>
          <SelectContent>
            {jewelryItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} - ${item.estimatedValue.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.jewelryItemId && (
          <p className="text-sm text-red-600">{errors.jewelryItemId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="loanProductId">Loan Product</Label>
        <Select
          value={selectedProduct}
          onValueChange={(value) => {
            setSelectedProduct(value)
            setValue('loanProductId', value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose loan product" />
          </SelectTrigger>
          <SelectContent>
            {loanProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.loanProductId && (
          <p className="text-sm text-red-600">{errors.loanProductId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestedAmount">Requested Amount</Label>
        <Input
          id="requestedAmount"
          type="number"
          step="0.01"
          {...register('requestedAmount', { valueAsNumber: true })}
          placeholder="Enter amount"
        />
        {maxLoanAmount > 0 && (
          <p className="text-sm text-gray-600">
            Maximum available: ${maxLoanAmount.toLocaleString()}
          </p>
        )}
        {errors.requestedAmount && (
          <p className="text-sm text-red-600">{errors.requestedAmount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="requestedDurationDays">Duration (Days)</Label>
        <Input
          id="requestedDurationDays"
          type="number"
          {...register('requestedDurationDays', { valueAsNumber: true })}
          placeholder="Enter duration in days"
        />
        {errors.requestedDurationDays && (
          <p className="text-sm text-red-600">{errors.requestedDurationDays.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Loan Purpose (Optional)</Label>
        <Input
          id="purpose"
          {...register('purpose')}
          placeholder="What will you use this loan for?"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Monthly Income (Optional)</Label>
          <Input
            id="monthlyIncome"
            type="number"
            step="0.01"
            {...register('monthlyIncome', { valueAsNumber: true })}
            placeholder="Enter monthly income"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employmentStatus">Employment Status</Label>
          <Select onValueChange={(value) => setValue('employmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">Employed</SelectItem>
              <SelectItem value="self_employed">Self Employed</SelectItem>
              <SelectItem value="unemployed">Unemployed</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || loanApplication.isPending}
      >
        {isSubmitting || loanApplication.isPending ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}
\`\`\`

## 4. Testing Strategy

### 4.1 Unit Testing

\`\`\`typescript
// tests/__tests__/lib/loan-calculator.test.ts
import { calculateLoanTerms, calculatePaymentSchedule } from '@/lib/loan-calculator'

describe('Loan Calculator', () => {
  describe('calculateLoanTerms', () => {
    it('should calculate correct loan terms for standard loan', () => {
      const result = calculateLoanTerms({
        principalAmount: 10000,
        profitRate: 0.10,
        durationDays: 365
      })

      expect(result.totalProfit).toBe(1000)
      expect(result.totalAmount).toBe(11000)
      expect(result.monthlyPayment).toBeCloseTo(916.67, 2)
    })

    it('should handle Shariah-compliant profit calculation', () => {
      const result = calculateLoanTerms({
        principalAmount: 5000,
        profitRate: 0.08,
        durationDays: 180
      })

      // Profit should be calculated for exact duration, not annualized
      const expectedProfit = 5000 * 0.08 * (180 / 365)
      expect(result.totalProfit).toBeCloseTo(expectedProfit, 2)
    })
  })
})
\`\`\`

### 4.2 Integration Testing

\`\`\`typescript
// tests/__tests__/api/loans/apply.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/loans/apply/route'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    jewelryItem: {
      findFirst: jest.fn()
    },
    loanProduct: {
      findUnique: jest.fn()
    },
    loanApplication: {
      create: jest.fn()
    }
  }
}))

describe('/api/loans/apply', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create loan application successfully', async () => {
    // Mock user token
    const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET!)
    
    // Mock database responses
    ;(prisma.jewelryItem.findFirst as jest.Mock).mockResolvedValue({
      id: 'jewelry-123',
      estimatedValue: 10000,
      status: 'approved'
    })
    
    ;(prisma.loanProduct.findUnique as jest.Mock).mockResolvedValue({
      id: 'product-123',
      maxLtvRatio: 0.7,
      isActive: true
    })
    
    ;(prisma.loanApplication.create as jest.Mock).mockResolvedValue({
      id: 'application-123',
      applicationNumber: 'LA123456789',
      status: 'submitted'
    })

    const { req } = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`
      },
      body: {
        jewelryItemId: 'jewelry-123',
        loanProductId: 'product-123',
        requestedAmount: 5000,
        requestedDurationDays: 90
      }
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.applicationNumber).toBe('LA123456789')
    expect(prisma.loanApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestedAmount: 5000,
          status: 'submitted'
        })
      })
    )
  })

  it('should reject application if requested amount exceeds LTV', async () => {
    const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET!)
    
    ;(prisma.jewelryItem.findFirst as jest.Mock).mockResolvedValue({
      id: 'jewelry-123',
      estimatedValue: 10000,
      status: 'approved'
    })
    
    ;(prisma.loanProduct.findUnique as jest.Mock).mockResolvedValue({
      id: 'product-123',
      maxLtvRatio: 0.7,
      isActive: true
    })

    const { req } = createMocks({
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`
      },
      body: {
        jewelryItemId: 'jewelry-123',
        loanProductId: 'product-123',
        requestedAmount: 8000, // Exceeds 70% of 10000
        requestedDurationDays: 90
      }
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('exceeds maximum allowed')
  })
})
\`\`\`

### 4.3 End-to-End Testing

\`\`\`typescript
// tests/e2e/loan-application.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Loan Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should complete loan application successfully', async ({ page }) => {
    // Navigate to loan application
    await page.click('[data-testid=apply-loan-button]')
    await expect(page).toHaveURL('/apply')

    // Fill jewelry submission form
    await page.selectOption('[data-testid=jewelry-category]', 'rings')
    await page.fill('[data-testid=jewelry-name]', 'Gold Wedding Ring')
    await page.selectOption('[data-testid=metal-type]', 'gold')
    await page.fill('[data-testid=metal-purity]', '18k')
    await page.fill('[data-testid=weight]', '5.2')

    // Upload jewelry images
    await page.setInputFiles('[data-testid=jewelry-images]', [
      'tests/fixtures/ring-main.jpg',
      'tests/fixtures/ring-detail.jpg'
    ])

    await page.click('[data-testid=submit-jewelry]')

    // Wait for AI valuation
    await expect(page.locator('[data-testid=valuation-result]')).toBeVisible()
    
    // Proceed to loan application
    await page.click('[data-testid=proceed-to-loan]')

    // Fill loan application form
    await page.selectOption('[data-testid=loan-product]', 'gold-jewelry-loan')
    await page.fill('[data-testid=requested-amount]', '3000')
    await page.fill('[data-testid=duration-days]', '90')
    await page.fill('[data-testid=purpose]', 'Business expansion')

    // Submit application
    await page.click('[data-testid=submit-application]')

    // Verify success
    await expect(page.locator('[data-testid=success-message]')).toContainText(
      'Loan application submitted successfully'
    )
    
    // Check application appears in dashboard
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid=pending-applications]')).toContainText(
      'Gold Wedding Ring'
    )
  })

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/apply')

    // Try to submit without required fields
    await page.click('[data-testid=submit-jewelry]')

    // Check validation errors
    await expect(page.locator('[data-testid=name-error]')).toContainText(
      'Jewelry name is required'
    )
    await expect(page.locator('[data-testid=metal-type-error]')).toContainText(
      'Please select metal type'
    )
  })
})
\`\`\`

## 5. Deployment Strategy

### 5.1 Docker Configuration

\`\`\`dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### 5.2 Docker Compose for Development

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://suyula:password@postgres:5432/suyula_liquid
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: suyula_liquid
      POSTGRES_USER: suyula
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
\`\`\`

### 5.3 CI/CD Pipeline

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Generate Prisma client
        run: npx prisma generate
        
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run unit tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: suyula-liquid
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: suyula-liquid-service
          cluster: suyula-liquid-cluster
          wait-for-service-stability: true
\`\`\`

## 6. Monitoring and Observability

### 6.1 Application Monitoring

\`\`\`typescript
// lib/monitoring.ts
import { createPrometheusMetrics } from 'prom-client'

export const metrics = {
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  }),
  
  loanApplications: new Counter({
    name: 'loan_applications_total',
    help: 'Total number of loan applications',
    labelNames: ['status']
  }),
  
  activeLoans: new Gauge({
    name: 'active_loans_total',
    help: 'Total number of active loans'
  }),
  
  databaseConnections: new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections'
  })
}

// Middleware to track HTTP requests
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration)
  })
  
  next()
}
\`\`\`

### 6.2 Error Tracking

\`\`\`typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.data) {
      delete event.request.data.password
      delete event.request.data.token
    }
    return event
  }
})

export function captureException(error: Error, context?: any) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context)
    }
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}
\`\`\`

## 7. Security Implementation

### 7.1 Input Validation and Sanitization

\`\`\`typescript
// lib/validation.ts
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Common validation schemas
export const emailSchema = z.string().email().toLowerCase()
export const passwordSchema = z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/)
export const uuidSchema = z.string().uuid()

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] })
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input.trim())
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  return input
}

// Rate limiting
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}
\`\`\`

### 7.2 Data Encryption

\`\`\`typescript
// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

export class EncryptionService {
  private key: Buffer

  constructor(secretKey: string) {
    this.key = crypto.scryptSync(secretKey, 'salt', KEY_LENGTH)
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, this.key)
    cipher.setAAD(Buffer.from('suyula-liquid', 'utf8'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const tag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(ALGORITHM, this.key)
    decipher.setAAD(Buffer.from('suyula-liquid', 'utf8'))
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const saltRounds = 12
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) reject(err)
        else resolve(hash)
      })
    })
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }
}

export const encryption = new EncryptionService(process.env.ENCRYPTION_KEY!)
\`\`\`

This comprehensive technical specification provides the foundation for building the Suyula Liquid platform. The implementation should follow these guidelines while adapting to specific requirements and constraints as they arise during development.
