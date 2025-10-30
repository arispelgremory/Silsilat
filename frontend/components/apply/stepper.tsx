"use client"

import { useState } from "react"
import { Check, CreditCard, FileCheck, Upload, User, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
  currentStep: number
}

export function Stepper({ currentStep }: StepperProps) {

  const steps = [
    {
      id: 1,
      name: "KYC Verification",
      icon: User,
      status: currentStep > 1 ? "complete" : currentStep === 1 ? "current" : "upcoming",
    },
    {
      id: 2,
      name: "Jewelry Submission",
      icon: Upload,
      status: currentStep > 2 ? "complete" : currentStep === 2 ? "current" : "upcoming",
    },
    {
      id: 3,
      name: "Wallet Connection",
      icon: Wallet,
      status: currentStep > 3 ? "complete" : currentStep === 3 ? "current" : "upcoming",
    },
    {
      id: 4,
      name: "Loan Offer",
      icon: FileCheck,
      status: currentStep > 4 ? "complete" : currentStep === 4 ? "current" : "upcoming",
    },
    {
      id: 5,
      name: "Disbursement",
      icon: CreditCard,
      status: currentStep > 5 ? "complete" : currentStep === 5 ? "current" : "upcoming",
    },
  ]

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  step.status === "complete"
                    ? "border-emerald-600"
                    : step.status === "current"
                      ? "border-emerald-600"
                      : "border-gray-200",
                )}
              >
                <span
                  className={cn(
                    "flex items-center text-sm font-medium",
                    step.status === "complete" ? "text-emerald-600" : "",
                  )}
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 mr-3">
                    {step.status === "complete" ? (
                      <Check className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <step.icon
                        className={cn("h-5 w-5", step.status === "current" ? "text-emerald-600" : "text-gray-500")}
                      />
                    )}
                  </span>
                  <span>{step.name}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
