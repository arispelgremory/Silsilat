import { ArrowRight, Camera, CreditCard, FileCheck, Upload, Wallet } from "lucide-react"
import React from "react"

export function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Submit Application",
      description: "Register and complete KYC verification with your ID and facial recognition.",
      step: "01"
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Jewelry Submission",
      description: "Upload images of your jewelry for AI-powered assessment and valuation.",
      step: "02"
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: "Receive Offer",
      description: "Get a financing offer based on your jewelry's value and create an NFT collateral.",
      step: "03"
    },
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Financing Disbursement",
      description: "Accept the offer and receive funds in your Hedera wallet or bank account.",
      step: "04"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Repayment",
      description: "Make repayments through multiple options including HBAR, stablecoins, or bank transfer.",
      step: "05"
    },
  ]

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Connection Line */}
      <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 z-0"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            {/* Step Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative z-10">
              {/* Step Number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <div className="text-emerald-600">
                  {step.icon}
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-bold mb-3 text-emerald-800 group-hover:text-emerald-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Arrow for larger screens */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-20 -right-8 z-20">
                <div className="w-16 h-0.5 bg-emerald-300"></div>
                <ArrowRight className="absolute -top-2 right-0 h-5 w-5 text-emerald-500" />
              </div>
            )}

            {/* Arrow for mobile/tablet */}
            {index < steps.length - 1 && (
              <div className="lg:hidden flex justify-center my-4">
                <div className="w-0.5 h-8 bg-emerald-300"></div>
                <div className="absolute">
                  <ArrowRight className="h-5 w-5 text-emerald-500 rotate-90 mt-1.5" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
