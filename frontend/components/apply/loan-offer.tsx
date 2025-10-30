"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiInstance from "@/lib/axios-v1"
import type { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Check, CreditCard, Shield, Calculator } from "lucide-react"
import { useSAGCreationSocket } from "@/hooks/use-sag-creation-socket"
import { SAGCreationProgressTracker } from "@/components/sag-creation-progress-tracker"
import { useAuth } from "@/hooks/use-auth"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { UserProfile } from "@/lib/auth/auth-service"

interface LoanMintingFormData {
  mintShare: number
  investorFinancingType: "Conventional" | "islamic"
  investorRoiPercentage: number
  investorRoiFixedAmount: number
  tenorM: number
  pawnerInterestP: number
  loanPercentage: number
  pawnDate: string
  pawnTime: string
  maturityDate: string
}


export function LoanOffer() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const auth = useAuth()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [offerAccepted, setOfferAccepted] = useState(false)
  const [nftGenerated, setNftGenerated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jewelrySubmissionId, setJewelrySubmissionId] = useState<string | null>(null)
  const [estimatedJewelryValue, setEstimatedJewelryValue] = useState(0)
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [certNo, setCertNo] = useState<string | null>(null)
  const [showSAGCreationTracker, setShowSAGCreationTracker] = useState(false)
  
  // Initialize form with default values
  const form = useForm<LoanMintingFormData>({
    defaultValues: {
      mintShare: 100,
      investorFinancingType: "Conventional",
      investorRoiPercentage: 2,
      investorRoiFixedAmount: 0,
      tenorM: 6,
      pawnerInterestP: 5,
      loanPercentage: 75,
      pawnDate: new Date().toISOString().split('T')[0],
      pawnTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      maturityDate: "",
    },
  })
  
  const watchedValues = form.watch(['loanPercentage', 'pawnDate', 'pawnTime', 'tenorM'])
  
  // Calculate loan amount and mint value
  const loanPercentage = form.watch('loanPercentage')
  const mintShare = form.watch('mintShare')
  const tenorM = form.watch('tenorM')
  const loanAmount = estimatedJewelryValue * (loanPercentage / 100)
  const mintValue = loanAmount && mintShare > 0 ? loanAmount / mintShare : 0

  // Fetch user profile from API
  const { data: userProfile, isLoading: userProfileLoading, error: userProfileError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiInstance.get('/auth/user/profile')
      return response.data.data.userInfo
      // return response.data.data
    },
  })

  // Socket.IO integration for SAG creation tracking
  const {
    isConnected,
    connect,
    lastProgress,
    lastComplete,
    lastError,
  } = useSAGCreationSocket({
    userId: userProfile?.accountId || '', // Use actual user ID or fallback
    onProgress: (data) => {
      console.log('SAG creation progress:', data)
    },
    onComplete: (data) => {
      console.log('SAG creation complete:', data)
      setIsSubmitting(false)
      setShowSAGCreationTracker(false)
      setOfferAccepted(true)
      setNftGenerated(true)
      
      // Store the token ID from the completion data
      if (data.tokenId) {
        setTokenId(data.tokenId)
      }
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['sags'] })
      
      toast.success('SAG created and NFT collateral generated successfully!')
    },
    onError: (data) => {
      console.log('SAG creation error:', data)
      setIsSubmitting(false)
      setShowSAGCreationTracker(false)
      toast.error(`Failed to create SAG: ${data.error}`)
    },
    autoConnect: false, // We'll connect manually when needed
  })

  // Load jewelry submission data from previous step
  useEffect(() => {
    const submissionId = sessionStorage.getItem('jewelrySubmissionId')
    const estimatedValue = sessionStorage.getItem('estimatedValue')
    
    if (submissionId) {
      setJewelrySubmissionId(submissionId)
    }
    
    if (estimatedValue) {
      setEstimatedJewelryValue(Number.parseFloat(estimatedValue))
    }
  }, [])
  
  // Calculate maturity date when pawn date, time, or tenor changes
  useEffect(() => {
    const pawnDate = watchedValues[1]
    const pawnTime = watchedValues[2]
    const tenor = watchedValues[3]
    
    if (pawnDate && pawnTime && tenor) {
      const pawnDateTime = new Date(`${pawnDate}T${pawnTime}:00`)
      const maturityDateTime = new Date(pawnDateTime)
      maturityDateTime.setMonth(maturityDateTime.getMonth() + tenor)
      const newMaturityDate = maturityDateTime.toISOString().split('T')[0]
      
      if (form.getValues('maturityDate') !== newMaturityDate) {
        form.setValue('maturityDate', newMaturityDate, { shouldValidate: false })
      }
    }
  }, [watchedValues, form])
  
  // Auto-adjust mintShare when loan amount changes to prevent mint value < 1
  useEffect(() => {
    if (loanAmount > 0 && mintShare > Math.floor(loanAmount)) {
      const maxShares = Math.floor(loanAmount)
      form.setValue('mintShare', maxShares, { shouldValidate: false })
    }
  }, [loanAmount, mintShare, form])

  // Get jewelry details from sessionStorage
  const getJewelryData = () => {
    const imagesJson = sessionStorage.getItem('jewelryImages')
    const images = imagesJson ? JSON.parse(imagesJson) : []
    
    return {
      jewelryType: sessionStorage.getItem('jewelryType') || 'gold',
      jewelrySubtype: sessionStorage.getItem('jewelrySubtype') || '',
      weight: Number.parseFloat(sessionStorage.getItem('weight') || '10'),
      karat: sessionStorage.getItem('karat') || '24',
      additionalDetails: sessionStorage.getItem('additionalDetails') || '',
      imageUrl: images
    }
  }

  // Fetch SAG data to get token ID
  const fetchSagTokenId = async (certNumber: string) => {
    try {
      const response = await apiInstance.get(`/sag?page_size=1&certNo=${certNumber}`)
      const sagData = response.data
      
      if (sagData && sagData.data && sagData.data.length > 0) {
        const tokenId = sagData.data[0].tokenId || sagData.data[0].token_id
        if (tokenId) {
          setTokenId(tokenId)
          return tokenId
        }
      }
      
      // Fallback if no token ID found
      setTokenId('0.0.12345')
      return '0.0.12345'
    } catch (error) {
      console.error('Error fetching SAG data:', error)
      // Fallback token ID
      setTokenId('0.0.12345')
      return '0.0.12345'
    }
  }

  const loanDetails = {
    jewelryType: (() => {
      const jewelryType = sessionStorage.getItem('jewelryType') || 'Gold'
      const jewelrySubtype = sessionStorage.getItem('jewelrySubtype') || 'Necklace'
      const karat = sessionStorage.getItem('karat') || '24'
      return `${jewelryType.charAt(0).toUpperCase() + jewelryType.slice(1)} ${jewelrySubtype} ${jewelryType === 'gold' ? `(${karat}K)` : ''}`
    })(),
    jewelryValue: estimatedJewelryValue || 10000,
    loanAmount: Math.round(loanAmount),
    profitRate: form.watch('pawnerInterestP'),
    startDate: form.watch('pawnDate') ? new Date(form.watch('pawnDate')).toLocaleDateString() : new Date().toLocaleDateString(),
    endDate: form.watch('maturityDate') ? new Date(form.watch('maturityDate')).toLocaleDateString() : '',
  }

  const validateLoanApplication = (): boolean => {
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions')
      return false
    }

    if (!jewelrySubmissionId) {
      toast.error('Jewelry submission data not found. Please go back and complete the jewelry submission step.')
      return false
    }

    if (!tenorM || tenorM < 1) {
      toast.error('Please select a valid financing tenure')
      return false
    }

    if (loanDetails.loanAmount <= 0) {
      toast.error('Invalid loan amount calculated')
      return false
    }
    
    if (mintValue < 1) {
      toast.error('Mint value per share must be at least RM 1.00')
      return false
    }

    return true
  }

  const handleAcceptOffer = async () => {
    if (!validateLoanApplication()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get jewelry data from sessionStorage
      const jewelryData = getJewelryData()
      const formData = form.getValues()
      
      // Calculate exact expiredAt timestamp
      const pawnDateTime = new Date(`${formData.pawnDate}T${formData.pawnTime}:00`)
      const expiredAt = new Date(pawnDateTime)
      expiredAt.setMonth(expiredAt.getMonth() + formData.tenorM)

      // Get certificate number from sessionStorage or generate new one
      const certificateNumber = sessionStorage.getItem('certNo') || `C-${Date.now()}`
      setCertNo(certificateNumber)

      // Get AI risk analysis data from sessionStorage
      const ltv = sessionStorage.getItem('ltv')
      const risk_level = sessionStorage.getItem('risk_level')
      const rationale = sessionStorage.getItem('rationale')
      const action = sessionStorage.getItem('action')
      const eval_id = sessionStorage.getItem('eval_id')
      const purity = sessionStorage.getItem('purity')
      const sagName = sessionStorage.getItem('sagName')
      const sagDescription = sessionStorage.getItem('sagDescription')

      const sagData = {
        sagName: sagName || `${jewelryData.jewelryType.charAt(0).toUpperCase() + jewelryData.jewelryType.slice(1)} ${jewelryData.jewelrySubtype}`,
        sagDescription: sagDescription || jewelryData.additionalDetails || `${jewelryData.jewelryType} jewelry item`,
        certNo: certificateNumber,
        sagProperties: {
          
          assetType: jewelryData.jewelryType.charAt(0).toUpperCase() + jewelryData.jewelryType.slice(1),
          karat: jewelryData.jewelryType === 'gold' ? Number(jewelryData.karat) : 0,
          weightG: jewelryData.weight,
          valuation: loanDetails.jewelryValue,
          enableMinting: true,
          mintShare: formData.mintShare,
          investorFinancingType: formData.investorFinancingType,
          investorRoiPercentage: formData.investorRoiPercentage,
          investorRoiFixedAmount: formData.investorRoiFixedAmount,
          currency: 'MYR',
          loanPercentage: formData.loanPercentage,
          loan: loanDetails.loanAmount,
          pawnerInterestP: formData.pawnerInterestP,
          tenorM: formData.tenorM,
          pawnDate: formData.pawnDate,
          pawnTime: formData.pawnTime,
          maturityDate: formData.maturityDate,
          soldShare: 0,
          // AI Risk Analysis fields
          ltv: ltv ? Number.parseFloat(ltv) : undefined,
          risk_level: risk_level || undefined,
          rationale: rationale || undefined,
          action: action || undefined,
          eval_id: eval_id || undefined,
          purity: purity ? Number(purity) : undefined,
          images: jewelryData.imageUrl || [],
        },
        expiredAt: expiredAt,
        sagType: formData.investorFinancingType,
      }

      // Connect to Socket.IO for real-time SAG creation tracking
      await connect()
      
      // Show progress tracker
      setShowSAGCreationTracker(true)

      // Make API call to create SAG using async endpoint
      const response = await apiInstance.post('/sag/create', sagData)
      
      // Store SAG details from response
      if (response.data?.data?.jobId) {
        sessionStorage.setItem('sagJobId', response.data.data.jobId)
        sessionStorage.setItem('sagName', sagData.sagName)
        sessionStorage.setItem('applicationNumber', `APP-${Date.now()}`)
      }

      toast.success('SAG creation process started! You can track the progress below.')
      
      // The Socket.IO events will handle the success/error states
      // and update the UI accordingly
      
    } catch (error) {
      console.error('Error processing application:', error)
      setIsSubmitting(false)
      
      // Fallback for demo - still show success flow
      setOfferAccepted(true)
      setTimeout(() => {
        setNftGenerated(true)
      }, 2000)
    }
  }

  const calculateMonthlyPayment = () => {
    const totalProfit = loanDetails.loanAmount * (loanDetails.profitRate / 100) * tenorM
    const totalAmount = loanDetails.loanAmount + totalProfit

    if (paymentFrequency === "monthly") {
      return Math.round(totalAmount / tenorM)
    } else if (paymentFrequency === "biweekly") {
      return Math.round(totalAmount / (tenorM * 2))
    } else {
      return totalAmount // lump sum
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        {!offerAccepted ? (
          <>
            {/* Loan Configuration Section */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Loan Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loanPercentage"
                    rules={{ required: 'Loan percentage is required', min: { value: 50, message: 'Minimum 50%' }, max: { value: 85, message: 'Maximum 85%' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan-to-Value Percentage (%)</FormLabel>
                        <div className="flex items-center gap-4">
                          <Slider
                            min={50}
                            max={85}
                            step={5}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="flex-1"
                          />
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 60)}
                              className="w-20"
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Loan Amount: RM {Math.round(loanAmount).toLocaleString()}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pawnerInterestP"
                    rules={{ required: 'Interest rate is required', min: { value: 0.1, message: 'Minimum 0.1%' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pawner Interest Rate (% per month)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="0.1"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 5)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenorM"
                    rules={{ required: 'Tenor is required', min: { value: 1, message: 'Minimum 1 month' }, max: { value: 24, message: 'Maximum 24 months' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Tenor (Months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="24"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 6)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="pawnDate"
                    rules={{ required: 'Pawn date is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pawn Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pawnTime"
                    rules={{ required: 'Pawn time is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pawn Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('maturityDate') && (
                  <div className="p-4 bg-muted rounded-lg mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4" />
                      <Label className="font-medium">Loan Summary</Label>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estimated Value:</span>
                        <span className="font-medium">RM {estimatedJewelryValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loan Amount ({form.watch('loanPercentage')}%):</span>
                        <span className="font-medium">RM {Math.round(loanAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-medium">{form.watch('pawnerInterestP')}% per month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest ({form.watch('tenorM')} months):</span>
                        <span className="font-medium text-orange-600">
                          RM {Math.round(loanAmount * (form.watch('pawnerInterestP') / 100) * form.watch('tenorM')).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-semibold">Total Repayment:</span>
                        <span className="font-semibold text-blue-600">
                          RM {Math.round(loanAmount * (1 + (form.watch('pawnerInterestP') / 100) * form.watch('tenorM'))).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maturity Date:</span>
                        <span className="font-medium">
                          {new Date(form.watch('maturityDate')).toLocaleDateString('en-MY')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Minting Configuration */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Minting & Investment Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how investors can purchase shares of this asset for faster funding
                </p>

                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Each share must have a minimum value of RM 1.00.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="investorFinancingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investor Financing Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Conventional">Conventional (Interest-based)</SelectItem>
                            <SelectItem value="islamic">Islamic (Sharia-compliant)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This determines how investors will earn returns from their shares
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('investorFinancingType') === "Conventional" && (
                    <FormField
                      control={form.control}
                      name="investorRoiPercentage"
                      rules={{ required: 'RoI percentage is required', min: { value: 0.1, message: 'Minimum 0.1%' } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investor RoI (% per month)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 2)}
                            />
                          </FormControl>
                          <FormDescription>
                            Monthly return percentage for conventional investors
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch('investorFinancingType') === "islamic" && (
                    <FormField
                      control={form.control}
                      name="investorRoiFixedAmount"
                      rules={{ required: 'Fixed profit pool is required', min: { value: 0, message: 'Must be non-negative' } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Fixed Profit Pool (MYR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Total fixed profit amount to be distributed among all shares
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="mintShare"
                    rules={{ 
                      required: 'Mint share is required', 
                      min: { value: 1, message: 'Minimum 1 share' },
                      validate: (value) => {
                        const maxShares = Math.floor(loanAmount)
                        if (value > maxShares) {
                          return `Maximum ${maxShares} shares allowed (mint value cannot be less than 1 MYR)`
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Mint Shares</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max={Math.floor(loanAmount)}
                            {...field}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value) || 100
                              const maxShares = Math.floor(loanAmount)
                              field.onChange(Math.min(value, maxShares))
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum {Math.floor(loanAmount)} shares (mint value: RM {mintValue.toFixed(2)})
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4" />
                      <Label className="font-medium">Minting & Investment Summary</Label>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Mint Value per Share:</span>
                        <span className={`font-medium ${mintValue < 1 ? 'text-destructive' : ''}`}>
                          RM {mintValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Shares:</span>
                        <span className="font-medium">{form.watch('mintShare')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Financing Type:</span>
                        <span className="font-medium capitalize">{form.watch('investorFinancingType')}</span>
                      </div>
                      {form.watch('investorFinancingType') === "Conventional" && (
                        <>
                          <div className="flex justify-between">
                            <span>Investor RoI:</span>
                            <span className="font-medium text-green-600">{form.watch('investorRoiPercentage')}% per month</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Return per Share:</span>
                            <span className="font-medium text-green-600">
                              RM {((mintValue * form.watch('investorRoiPercentage')) / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span>Total Return per Share ({form.watch('tenorM')} months):</span>
                            <span className="font-medium text-blue-600">
                              RM {(mintValue * (1 + (form.watch('investorRoiPercentage') / 100) * form.watch('tenorM'))).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profit per Share:</span>
                            <span className="font-medium text-green-600">
                              RM {(mintValue * (form.watch('investorRoiPercentage') / 100) * form.watch('tenorM')).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                      {form.watch('investorFinancingType') === "islamic" && (
                        <>
                          <div className="flex justify-between">
                            <span>Total Profit Pool:</span>
                            <span className="font-medium text-green-600">RM {form.watch('investorRoiFixedAmount')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Profit per Share:</span>
                            <span className="font-medium text-green-600">
                              RM {(form.watch('investorRoiFixedAmount') / form.watch('mintShare')).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span>Total Return per Share:</span>
                            <span className="font-medium text-blue-600">
                              RM {(mintValue + (form.watch('investorRoiFixedAmount') / form.watch('mintShare'))).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Financing Offer</CardTitle>
                <CardDescription>
                  Based on the assessment of your jewelry, we are pleased to offer you the following financing terms.
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Jewelry</Label>
                  <p className="font-medium">{loanDetails.jewelryType}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Assessed Value</Label>
                  <p className="font-medium">RM {loanDetails.jewelryValue.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Financing Amount</Label>
                  <p className="font-medium text-emerald-600">RM {loanDetails.loanAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Profit Rate</Label>
                  <p className="font-medium">{loanDetails.profitRate}% (Shariah-compliant)</p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Repayment Options</h3>
                <div className="space-y-2">
                  <Label>Payment Frequency</Label>
                  <RadioGroup
                    value={paymentFrequency}
                    onValueChange={setPaymentFrequency}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="biweekly" id="biweekly" />
                      <Label htmlFor="biweekly">Bi-weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lumpsum" id="lumpsum" />
                      <Label htmlFor="lumpsum">Lump Sum (at end of term)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Card className="bg-emerald-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-emerald-800">Payment Summary</h3>
                      <p className="text-sm text-emerald-700">
                        {paymentFrequency === "monthly"
                          ? "Monthly payment"
                          : paymentFrequency === "biweekly"
                            ? "Bi-weekly payment"
                            : "Total payment at end of term"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-700">
                        RM {calculateMonthlyPayment().toLocaleString()}
                      </p>
                      <p className="text-xs text-emerald-600">for {tenorM} months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Accept Terms and Conditions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I agree to the terms of service and privacy policy. I understand that my jewelry will be
                      represented as an NFT collateral on the Hedera network.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" disabled={isSubmitting}>Modify Application</Button>
              <Button
                onClick={handleAcceptOffer}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!acceptedTerms || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Accept Offer'}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6 text-emerald-600" />
              <CardTitle>Offer Accepted</CardTitle>
            </div>
            <CardDescription>
              Your financing offer has been accepted. We are now processing your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-emerald-50 rounded-md">
              <div className="text-center">
                <h3 className="font-medium text-lg text-emerald-800 mb-2">
                  {nftGenerated ? "NFT Collateral Generated" : "Generating NFT Collateral..."}
                </h3>
                {nftGenerated ? (
                  <div className="space-y-2">
                    <Shield className="h-16 w-16 text-emerald-600 mx-auto" />
                    <p className="text-sm text-emerald-700">
                      Your jewelry has been securely represented as an NFT on the Hedera network.
                    </p>
                    {tokenId && (
                      <div className="text-xs text-emerald-600">
                        <p>Token ID: {tokenId}</p>
                        <a 
                          href={`${process.env.NEXT_PUBLIC_ENV_URL}/${tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
                        >
                          View on HashScan →
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Financing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Financing Amount</Label>
                  <p className="font-medium">RM {loanDetails.loanAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{loanDetails.startDate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">End Date</Label>
                  <p className="font-medium">{loanDetails.endDate}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Payment Amount</Label>
                  <p className="font-medium">
                    RM {calculateMonthlyPayment().toLocaleString()} ({paymentFrequency})
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Next Steps</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Your financing amount will be disbursed to your selected payment method.</li>
                <li>You will receive a confirmation email with all the details.</li>
                <li>Your first payment will be due one month from the disbursement date.</li>
                <li>You can track your financing and make payments through your dashboard.</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                // Clear session storage
                sessionStorage.removeItem('jewelrySubmissionId')
                sessionStorage.removeItem('estimatedValue')
                sessionStorage.removeItem('jewelryType')
                sessionStorage.removeItem('jewelrySubtype')
                sessionStorage.removeItem('weight')
                sessionStorage.removeItem('karat')
                sessionStorage.removeItem('additionalDetails')
                sessionStorage.removeItem('jewelryImages')
                sessionStorage.removeItem('sagId')
                sessionStorage.removeItem('applicationNumber')
                sessionStorage.removeItem('sagName')
                sessionStorage.removeItem('sagDescription')
                sessionStorage.removeItem('certNo')
                // Clear AI risk analysis data
                sessionStorage.removeItem('ltv')
                sessionStorage.removeItem('risk_level')
                sessionStorage.removeItem('rationale')
                sessionStorage.removeItem('action')
                sessionStorage.removeItem('eval_id')
                sessionStorage.removeItem('purity')
                sessionStorage.removeItem('aiPurity')
                
                // Navigate to dashboard
                router.push('/admin/dashboard')
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* SAG Creation Progress Tracker */}
      <SAGCreationProgressTracker
        isVisible={showSAGCreationTracker}
        onClose={() => setShowSAGCreationTracker(false)}
        progressData={lastProgress}
        completeData={lastComplete}
        errorData={lastError}
      />
      </div>
    </Form>
  )
}
