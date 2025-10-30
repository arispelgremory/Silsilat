"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
// Using HTML date input instead of custom DatePicker
import { toast } from "sonner";
import { Calculator, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import apiInstance from '@/lib/axios-v1';
import type { AxiosError } from 'axios'
import { DatePicker } from '../ui/datepicker'

interface NFTFormData {
    sagName: string
    sagDescription: string
    certNo: string
    assetType: string
    karat: number
    weightG: number
    valuation: number
    enableMinting: boolean
    mintShare: number
    investorFinancingType: 'Conventional' | 'islamic'
    investorRoiPercentage: number
    investorRoiFixedAmount: number
    currency: string
    loanPercentage: number
    loan: number
    pawnerInterestP: number
    tenorM: number
    pawnDate: string
    pawnTime: string
    maturityDate: string
}

export function CreateNFTForm() {
    const router = useRouter()
    const [mintValue, setMintValue] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<NFTFormData>({
        defaultValues: {
            sagName: '',
            sagDescription: '',
            certNo: '',
            assetType: 'Gold',
            karat: 22,
            weightG: 0,
            valuation: 0,
            enableMinting: false,
            mintShare: 100,
            investorFinancingType: 'Conventional',
            investorRoiPercentage: 2,
            investorRoiFixedAmount: 0,
            currency: 'MYR',
            loanPercentage: 60,
            loan: 0,
            pawnerInterestP: 5,
            tenorM: 6,
            pawnDate: new Date().toISOString().split('T')[0], // Today's date
            pawnTime: new Date().toTimeString().split(' ')[0].substring(0, 5), // Current time (HH:MM)
            maturityDate: '', // Will be calculated
        },
    })

    const watchedValues = form.watch(['valuation', 'mintShare', 'enableMinting'])

    useEffect(() => {
        const [valuation, mintShare, enableMinting] = watchedValues

        // Convert to proper types
        const valuationNum = Number(valuation)
        const mintShareNum = Number(mintShare)
        const enableMintingBool = Boolean(enableMinting)

        // Calculate mint value
        if (enableMintingBool && valuationNum && mintShareNum && mintShareNum > 0) {
            const calculatedMintValue = valuationNum / mintShareNum
            setMintValue(Number(calculatedMintValue.toFixed(2)))

            // If mint value would be less than 1, adjust mintShare to make it exactly 1
            if (calculatedMintValue < 1) {
                const maxAllowedShares = Math.floor(valuationNum)
                // Only update if the value is different to prevent infinite loop
                if (mintShareNum !== maxAllowedShares) {
                    form.setValue('mintShare', maxAllowedShares, { shouldValidate: false })
                }
            }
        } else if (!enableMintingBool) {
            setMintValue(0)
        }
    }, [watchedValues, form])

    // Watch for changes in pawn date, time and tenor to calculate maturity date
    const watchedDateValues = form.watch(['pawnDate', 'pawnTime', 'tenorM'])

    useEffect(() => {
        const [pawnDate, pawnTime, tenorM] = watchedDateValues

        if (pawnDate && pawnTime && tenorM) {
            // Combine pawn date and time to create exact pawn datetime
            const pawnDateTime = new Date(`${pawnDate}T${pawnTime}:00`)

            // Calculate exact maturity datetime
            const maturityDateTime = new Date(pawnDateTime)
            maturityDateTime.setMonth(maturityDateTime.getMonth() + Number(tenorM))

            const formattedMaturityDate = maturityDateTime.toISOString().split('T')[0]

            // Only update if the value is different to prevent infinite loop
            if (form.getValues('maturityDate') !== formattedMaturityDate) {
                form.setValue('maturityDate', formattedMaturityDate, { shouldValidate: false })
            }
        }
    }, [watchedDateValues, form])

    const handleSubmit = async (data: NFTFormData) => {
        setIsSubmitting(true)

        // Calculate exact expiredAt timestamp
        const pawnDateTime = new Date(`${data.pawnDate}T${data.pawnTime}:00`)
        const expiredAt = new Date(pawnDateTime)
        expiredAt.setMonth(expiredAt.getMonth() + Number(data.tenorM))

        const nftData = {
            sagName: data.sagName,
            sagDescription: data.sagDescription,
            certNo: data.certNo,
            sagProperties: {
                assetType: data.assetType,
                karat: data.karat,
                weightG: data.weightG,
                valuation: data.valuation,
                enableMinting: data.enableMinting,
                mintShare: data.mintShare,
                investorFinancingType: data.investorFinancingType,
                investorRoiPercentage: data.investorRoiPercentage,
                investorRoiFixedAmount: data.investorRoiFixedAmount,
                currency: data.currency,
                loanPercentage: data.loanPercentage,
                loan: data.loan,
                pawnerInterestP: data.pawnerInterestP,
                tenorM: data.tenorM,
                pawnDate: data.pawnDate,
                pawnTime: data.pawnTime,
                maturityDate: data.maturityDate,
            },
            expiredAt: expiredAt,
            sagType: data.investorFinancingType,
        }

        // Make API call to create NFT
        const response = apiInstance.post('/sag/create', nftData);

        toast.promise(response, {
            loading: 'Creating NFT...',
            success: () => {
                // Navigate back to dashboard after a short delay
                setTimeout(() => {
                    router.push('/pawnshop/dashboard')
                }, 2000)
                return `NFT Created Successfully!`
            },
            error: (error: AxiosError) => {

                console.error('Error creating NFT:', error)

                let errorMessage = 'An unexpected error occurred while creating the NFT.'

                if (error.message) {
                    errorMessage = error.message
                }

                return `Failed to create NFT. ${errorMessage}`
            },
            finally: () => {
                setIsSubmitting(false)
            }
        })

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Certificate Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Information</CardTitle>
                            <CardDescription>Basic details about the asset certificate</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="sagName"
                                rules={{ required: 'SAG name is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SAG Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Platinum Necklace" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sagDescription"
                                rules={{ required: 'SAG description is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SAG Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Necklace" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="certNo"
                                rules={{ required: 'Certificate number is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Certificate Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="C-12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assetType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Type</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="karat"
                                    rules={{ required: 'Karat is required', min: 1 }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Karat</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="weightG"
                                    rules={{ required: 'Weight is required', min: 0.1 }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (g)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Valuation & Minting */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Valuation & Minting</CardTitle>
                            <CardDescription>Set the asset value and optionally enable minting</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="valuation"
                                rules={{ required: 'Valuation is required', min: 1 }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Valuation (MYR)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="enableMinting"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Enable Minting (Optional)
                                            </FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Allow this NFT to be divided into tradeable shares
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {form.watch('enableMinting') && (
                                <>
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Each mint share must have a minimum value of RM 1.00.
                                            The system will automatically adjust shares if needed to maintain this requirement.
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="investorFinancingType"
                                        rules={{ required: 'Investor financing type is required when minting is enabled' }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Investor Financing Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select investor financing type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Conventional">Conventional (Interest-based for investors)</SelectItem>
                                                        <SelectItem value="Islamic">Islamic (Sharia-compliant for investors)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    This determines how investors will earn returns from their share purchases
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch('investorFinancingType') === 'Conventional' && (
                                        <FormField
                                            control={form.control}
                                            name="investorRoiPercentage"
                                            rules={{ required: 'RoI percentage is required for Conventional financing', min: 0.1 }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Investor RoI (% per month)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            min="0.1"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground">
                                                        Monthly return percentage for Conventional investors
                                                    </p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {form.watch('investorFinancingType') === 'islamic' && (
                                        <FormField
                                            control={form.control}
                                            name="investorRoiFixedAmount"
                                            rules={{ required: 'Fixed RoI amount is required for Islamic financing', min: 0 }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Fixed Profit Pool (MYR)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground">
                                                        Total fixed profit amount to be distributed among all shares
                                                    </p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="mintShare"
                                        rules={{
                                            required: form.watch('enableMinting') ? 'Mint share is required when minting is enabled' : false,
                                            min: 1,
                                            validate: (value) => {
                                                const enableMinting = form.getValues('enableMinting')
                                                if (!enableMinting) return true

                                                const valuation = form.getValues('valuation')
                                                if (valuation && value && (valuation / value) < 1) {
                                                    return `Maximum ${Math.floor(valuation)} shares allowed (mint value cannot be less than 1 MYR)`
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
                                                        {...field}
                                                        onChange={(e) => {
                                                            const value = Number(e.target.value)
                                                            const valuation = form.getValues('valuation')

                                                            // Prevent setting shares that would make mint value < 1
                                                            if (valuation && value && (valuation / value) >= 1) {
                                                                field.onChange(value)
                                                            } else if (valuation && value) {
                                                                // Auto-correct to maximum allowed shares
                                                                const maxShares = Math.floor(valuation)
                                                                field.onChange(maxShares)
                                                            } else {
                                                                field.onChange(value)
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calculator className="h-4 w-4" />
                                            <Label className="font-medium">Minting & Investment Summary</Label>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Mint Value per Share:</span>
                                                <span className={`font-medium ${mintValue < 1 ? 'text-destructive' : ''}`}>
                                                    MYR {mintValue}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Shares:</span>
                                                <span className="font-medium">{form.watch('mintShare') || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Financing Type:</span>
                                                <span className="font-medium capitalize">{form.watch('investorFinancingType') || 'Conventional'}</span>
                                            </div>
                                            {form.watch('investorFinancingType') === 'Conventional' && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Investor RoI:</span>
                                                        <span className="font-medium text-green-600">{form.watch('investorRoiPercentage') || 0}% per month</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Monthly Return per Share:</span>
                                                        <span className="font-medium text-green-600">
                                                            MYR {((mintValue * (form.watch('investorRoiPercentage') || 0)) / 100).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    {form.watch('tenorM') && (
                                                        <>
                                                            <div className="flex justify-between border-t pt-1 mt-2">
                                                                <span>Total Return per Share ({form.watch('tenorM')} months):</span>
                                                                <span className="font-medium text-blue-600">
                                                                    MYR {(mintValue * (1 + (form.watch('investorRoiPercentage') || 0) / 100 * (form.watch('tenorM') || 0))).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Profit per Share:</span>
                                                                <span className="font-medium text-green-600">
                                                                    MYR {(mintValue * (form.watch('investorRoiPercentage') || 0) / 100 * (form.watch('tenorM') || 0)).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {form.watch('investorFinancingType') === 'islamic' && (
                                                <>
                                                    <div className="flex justify-between">
                                                        <span>Total Profit Pool:</span>
                                                        <span className="font-medium text-green-600">MYR {form.watch('investorRoiFixedAmount') || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Profit per Share:</span>
                                                        <span className="font-medium text-green-600">
                                                            MYR {form.watch('mintShare') ? ((form.watch('investorRoiFixedAmount') || 0) / (form.watch('mintShare') || 1)).toFixed(2) : '0.00'}
                                                        </span>
                                                    </div>
                                                    {form.watch('tenorM') && (
                                                        <>
                                                            <div className="flex justify-between border-t pt-1 mt-2">
                                                                <span>Total Return per Share ({form.watch('tenorM')} months):</span>
                                                                <span className="font-medium text-blue-600">
                                                                    MYR {(mintValue + (form.watch('mintShare') ? ((form.watch('investorRoiFixedAmount') || 0) / (form.watch('mintShare') || 1)) : 0)).toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Profit per Share:</span>
                                                                <span className="font-medium text-green-600">
                                                                    MYR {form.watch('mintShare') ? ((form.watch('investorRoiFixedAmount') || 0) / (form.watch('mintShare') || 1)).toFixed(2) : '0.00'}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            {mintValue < 1 && (
                                                <div className="text-xs text-destructive mt-2">
                                                    ⚠️ Mint value must be at least MYR 1.00
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tenor Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Duration</CardTitle>
                        <CardDescription>Set the investment period for this NFT</CardDescription>
                    </CardHeader>
                    <CardContent className='px-6 space-y-4'>
                        <FormField
                            control={form.control}
                            name="tenorM"
                            rules={{ required: 'Investment tenor is required', min: 1 }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Investment Tenor (Months)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Duration for the investment period and returns calculation
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pawnDate"
                                rules={{ required: 'Pawn date is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pawn Date (Tarikh Gadai)</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select pawn date"
                                            />
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
                                            <Input
                                                type="time"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="maturityDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Maturity Date (Tarikh Luput)</FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Auto-calculated"
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Auto-calculated based on pawn date and tenor
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Exact Maturity DateTime Display */}
                        {form.watch('pawnDate') && form.watch('pawnTime') && form.watch('tenorM') && (
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calculator className="h-4 w-4" />
                                    <Label className="font-medium">Exact Maturity Details</Label>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Pawn DateTime:</span>
                                        <span className="font-medium">
                                            {new Date(`${form.watch('pawnDate')}T${form.watch('pawnTime')}:00`).toLocaleString('en-MY')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Exact Maturity DateTime:</span>
                                        <span className="font-medium text-orange-600">
                                            {(() => {
                                                const pawnDateTime = new Date(`${form.watch('pawnDate')}T${form.watch('pawnTime')}:00`)
                                                const maturityDateTime = new Date(pawnDateTime)
                                                maturityDateTime.setMonth(maturityDateTime.getMonth() + Number(form.watch('tenorM')))
                                                return maturityDateTime.toLocaleString('en-MY')
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Investment Duration:</span>
                                        <span className="font-medium">{form.watch('tenorM')} months</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    {/* <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/pawnshop/dashboard')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button> */}
                    <Button className="bg-brightGold hover:bg-gold text-deepGreen" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating NFT...
                            </>
                        ) : (
                            'Create NFT'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}