"use client"

import { Suspense, useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JewelrySubmission } from "@/components/apply/jewelry-submission"
import { KYCVerification } from "@/components/apply/kyc-verification"
import { WalletConnection } from "@/components/apply/wallet-connection"
import { LoanOffer } from "@/components/apply/loan-offer"
import { Stepper } from "@/components/apply/stepper"

const steps = [
  "kyc",
  "jewelry",
  "wallet",
  "offer",
]

export default function ApplyPage() {

  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, [])

  useEffect(() => {
    if (currentStep === 3) {
      nextStep();
    }

    console.log("currentStep", currentStep);
  }, [currentStep, nextStep])

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Apply for Financing</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Complete the following steps to apply for Shariah-compliant jewelry financing. Our AI-powered system will
          evaluate your jewelry and provide you with an instant offer.
        </p>
      </div>

      <Stepper currentStep={currentStep} />

      <Tabs defaultValue={`apply-step-${currentStep}`} className="mt-8" key={`apply-step-${currentStep}`}>
        {/* <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kyc">KYC Verification</TabsTrigger>
          <TabsTrigger value="jewelry">Jewelry Submission</TabsTrigger>
          <TabsTrigger value="wallet">Wallet Connection</TabsTrigger>
          <TabsTrigger value="offer">Loan Offer</TabsTrigger>
        </TabsList> */}

        <TabsContent value={`apply-step-1`} >
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification</CardTitle>
              <CardDescription>Verify your identity to proceed with your financing application.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading KYC verification...</div>}>
                <KYCVerification nextStep={nextStep} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={`apply-step-2`} >
          <Card>
            <CardHeader>
              <CardTitle>Jewelry Submission</CardTitle>
              <CardDescription>Upload images and details of your jewelry for AI-powered assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <JewelrySubmission nextStep={nextStep} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={`apply-step-3`} >
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>Connect your Hedera wallet to receive financing and make repayments.</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={`apply-step-4`} >
          <Card>
            <CardHeader>
              <CardTitle>Loan Offer</CardTitle>
              <CardDescription>Review and accept your financing offer.</CardDescription>
            </CardHeader>
            <CardContent>
              <LoanOffer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
