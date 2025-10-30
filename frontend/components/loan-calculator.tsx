"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function LoanCalculator() {
  const [jewelryType, setJewelryType] = useState("gold")
  const [weight, setWeight] = useState(10)
  const [karat, setKarat] = useState("24")
  const [estimatedValue, setEstimatedValue] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)

  const calculateLoan = () => {
    let baseRate = 0

    // Base rate per gram based on jewelry type and karat
    if (jewelryType === "gold") {
      if (karat === "24") baseRate = 250
      else if (karat === "22") baseRate = 230
      else if (karat === "18") baseRate = 190
    } else if (jewelryType === "silver") {
      baseRate = 3
    } else if (jewelryType === "diamond") {
      baseRate = 1500 // Per carat for diamond
    }

    // Calculate estimated value
    const value = weight * baseRate
    setEstimatedValue(value)

    // Loan amount is typically 70-80% of the estimated value
    setLoanAmount(Math.round(value * 0.75))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jewelry-type">Jewelry Type</Label>
        <Select value={jewelryType} onValueChange={(value) => setJewelryType(value)}>
          <SelectTrigger id="jewelry-type" className="border-gold/20">
            <SelectValue placeholder="Select jewelry type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="diamond">Diamond</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {jewelryType === "gold" && (
        <div className="space-y-2">
          <Label htmlFor="karat">Karat</Label>
          <Select value={karat} onValueChange={(value) => setKarat(value)}>
            <SelectTrigger id="karat" className="border-gold/20">
              <SelectValue placeholder="Select karat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24K</SelectItem>
              <SelectItem value="22">22K</SelectItem>
              <SelectItem value="18">18K</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="weight">Weight ({jewelryType === "diamond" ? "carats" : "grams"})</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="weight"
            min={1}
            max={jewelryType === "diamond" ? 10 : 100}
            step={jewelryType === "diamond" ? 0.1 : 1}
            value={[weight]}
            onValueChange={(value) => setWeight(value[0])}
            className="flex-1"
          />
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
            className="w-20 border-gold/20"
          />
        </div>
      </div>

      <Button onClick={calculateLoan} className="w-full bg-brightGold hover:bg-gold text-deepGreen">
        Calculate
      </Button>

      {estimatedValue > 0 && (
        <div className="mt-6 p-4 bg-softBeige rounded-lg border border-gold/20">
          <div className="mb-2">
            <span className="text-sm text-darkOlive">Estimated Value:</span>
            <p className="text-lg font-semibold text-deepGreen">RM {estimatedValue.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-sm text-darkOlive">Potential Financing Amount:</span>
            <p className="text-2xl font-bold text-gold">RM {loanAmount.toLocaleString()}</p>
          </div>
          <p className="text-xs text-darkOlive mt-2">
            Note: Final valuation will be determined after physical assessment.
          </p>
        </div>
      )}
    </div>
  )
}
