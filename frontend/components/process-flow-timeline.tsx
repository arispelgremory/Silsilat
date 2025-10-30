"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, RefreshCw, Clock, AlertTriangle } from "lucide-react"

export function ProcessFlowTimeline() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 1,
      title: "SAG Tokenization & Listing",
      icon: <Upload className="h-6 w-6" />,
      description: "Initial setup and token creation",
      details: [
        "Ar Rahnu uploads SAG (maker/checker)",
        "NFT + fractional tokens minted",
        "Tokens listed on marketplace",
      ],
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Repayment & Settlement",
      icon: <RefreshCw className="h-6 w-6" />,
      description: "Successful loan completion",
      details: [
        "Borrower repays Ar Rahnu",
        "Ar Rahnu repays Liquid",
        "Investor receives full amount + 6% p.a. (daily prorated)",
        "Tokens + NFTs are burned",
      ],
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Loan Extension",
      icon: <Clock className="h-6 w-6" />,
      description: "Optional loan extension process",
      details: [
        "Borrower can extend loan (up to 2x, 6 months each)",
        "Each extension = new listing with new NFT/token",
      ],
      color: "bg-yellow-500",
    },
    {
      id: 4,
      title: "Default & Recovery",
      icon: <AlertTriangle className="h-6 w-6" />,
      description: "Default handling and recovery",
      details: [
        "If borrower defaults → Ar Rahnu sells collateral",
        "Ar Rahnu repays investors fully",
        "Liquid distributes proceeds to investors",
      ],
      color: "bg-red-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Timeline Navigation */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <Button
              variant={activeStep === index ? "default" : "outline"}
              className={`h-12 px-4 ${
                activeStep === index
                  ? "bg-brightGold text-deepGreen hover:bg-gold"
                  : "border-gold text-gold hover:bg-gold/10"
              }`}
              onClick={() => setActiveStep(index)}
            >
              <span className="mr-2">{step.icon}</span>
              <span className="hidden sm:inline">Step {step.id}</span>
            </Button>
            {index < steps.length - 1 && <ArrowRight className="h-6 w-6 text-gold mx-2 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Active Step Details */}
      <Card className="border-gold/20 max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${steps[activeStep].color} text-white`}>{steps[activeStep].icon}</div>
            <div>
              <CardTitle className="text-deepGreen text-2xl">{steps[activeStep].title}</CardTitle>
              <CardDescription className="text-lg">{steps[activeStep].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps[activeStep].details.map((detail, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1 border-gold text-gold">
                  {index + 1}
                </Badge>
                <p className="text-darkOlive">{detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index === activeStep ? "bg-brightGold" : "bg-gold/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
