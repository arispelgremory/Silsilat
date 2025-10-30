"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Camera, Check, Upload, AlertTriangle, Shield, Eye, Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"

interface JewelryFormData {
  jewelryType: string
  jewelrySubtype: string
  weight: number
  karat: string
  purity: number
  additionalDetails: string
  sagName: string
  sagDescription: string
  certNo: string
}

export function JewelrySubmission({ nextStep }: { nextStep: () => void }) {
  const [images, setImages] = useState<string[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [estimatedValue, setEstimatedValue] = useState(0)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [aiAssessment, setAiAssessment] = useState<{
    ltv: number
    risk_level: string
    rationale: string
    action: string
    purity?: number
    eval_id: string
  } | null>(null)
  
  const form = useForm<JewelryFormData>({
    defaultValues: {
      jewelryType: "gold",
      jewelrySubtype: "",
      weight: 10,
      karat: "24",
      purity: 999,
      additionalDetails: "",
      sagName: "",
      sagDescription: "",
      certNo: "",
    },
  })
  
  const watchedValues = form.watch(['jewelryType', 'karat'])
  
  // Update purity when karat changes
  useEffect(() => {
    const jewelryType = watchedValues[0]
    const karat = watchedValues[1]
    
    if (jewelryType === 'gold' && karat) {
      // Calculate purity and cap at 999 (industry standard for pure gold)
      const calculatedPurity = Math.round((Number(karat) / 24) * 1000)
      const purity = Math.min(calculatedPurity, 999)
      form.setValue('purity', purity, { shouldValidate: false })
    }
  }, [watchedValues, form])

  const handleImageUpload = () => {
    // Simulate image upload with dummy placeholder

    const jewelryType = form.getValues('jewelryType')

    let placeholderImage = "/placeholder.svg"

    if (jewelryType === "gold") {
      placeholderImage = "/gold.webp"
    } else if (jewelryType === "silver") {
      placeholderImage = "/silver.jpg"
    } else if (jewelryType === "diamond") {
      placeholderImage = "/diamond.jpeg"
    }


    const newImages = [...images, `${placeholderImage}?height=200&width=200&text=Jewelry+Image+${images.length + 1}`]
    setImages(newImages)
  }

  const validateSubmission = (): boolean => {
    if (images.length < 1) {
      toast.error('Please upload at least one image before scanning')
      return false
    }

    const jewelrySubtype = form.getValues('jewelrySubtype')
    if (!jewelrySubtype) {
      toast.error('Please select a jewelry item type')
      return false
    }

    const weight = form.getValues('weight')
    if (weight <= 0) {
      toast.error('Please enter a valid weight')
      return false
    }

    const jewelryType = form.getValues('jewelryType')
    const karat = form.getValues('karat')
    if (jewelryType === 'gold' && !karat) {
      toast.error('Please select the karat value for gold jewelry')
      return false
    }

    return true
  }

  const handleScan = () => {
    if (!validateSubmission()) {
      return
    }

    const jewelryType = form.getValues('jewelryType')
    const karat = form.getValues('karat')
    const weight = form.getValues('weight')

    // Simulate AI scanning process
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanComplete(true)
      
      // Calculate estimated value based on jewelry details
      let baseRate = 0
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
      
      // Generate a dummy submission ID for the next step
      const dummySubmissionId = `JS_${Date.now()}`
      setSubmissionId(dummySubmissionId)

      // Simulate AI Risk Analysis
      const loanAmount = value * 0.75 // 75% LTV
      const ltv = 0.75
      const ltvPercentage = ltv * 100

      let risk_level = "MEDIUM"
      let action = "monitor"
      
      if (ltvPercentage < 60) {
        risk_level = "VERY_LOW"
        action = "approve"
      } else if (ltvPercentage < 70) {
        risk_level = "LOW"
        action = "approve"
      } else if (ltvPercentage < 80) {
        risk_level = "MEDIUM"
        action = "monitor"
      } else if (ltvPercentage <= 85) {
        risk_level = "HIGH"
        action = "monitor"
      } else {
        risk_level = "VERY_HIGH"
        action = "margin_call"
      }

      // Calculate purity based on karat (for gold) - cap at 999
      let purity = 0
      if (jewelryType === "gold") {
        const calculatedPurity = Math.round((Number(karat) / 24) * 1000)
        purity = Math.min(calculatedPurity, 999)
      }

      const rationale = `Action: ${action}\nRationale: The loan-to-value (LTV) ratio is ${ltvPercentage.toFixed(2)}%, which ${
        ltvPercentage < 60 ? 'is well below the safe threshold, indicating very low risk.'
        : ltvPercentage < 70 ? 'is within safe limits with low risk.'
        : ltvPercentage < 80 ? 'is at a moderate level requiring standard monitoring.'
        : ltvPercentage <= 85 ? 'exceeds the safe limit but is below the margin call threshold, requiring close monitoring.'
        : 'exceeds the margin call threshold and requires immediate action.'
      } The ${jewelryType} item weighing ${weight}g with ${karat}K purity provides adequate collateral value.`

      setAiAssessment({
        ltv,
        risk_level,
        rationale,
        action,
        purity: purity > 0 ? purity : undefined,
        eval_id: `eval-${Date.now()}`
      })
    }, 3000)
  }

  const goldSubtypes = ["Necklace", "Bracelet", "Ring", "Earrings", "Pendant"]
  const silverSubtypes = ["Necklace", "Bracelet", "Ring", "Earrings", "Flatware"]
  const diamondSubtypes = ["Ring", "Earrings", "Pendant", "Bracelet", "Loose Diamond"]

  const jewelryType = form.watch('jewelryType')
  const subtypes = jewelryType === "gold" ? goldSubtypes : jewelryType === "silver" ? silverSubtypes : diamondSubtypes

  return (
    <Form {...form}>
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <FormField
              control={form.control}
              name="jewelryType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Jewelry Type</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gold" id="gold" />
                <Label htmlFor="gold">Gold</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="silver" id="silver" />
                <Label htmlFor="silver">Silver</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="diamond" id="diamond" />
                <Label htmlFor="diamond">Diamond</Label>
              </div>
            </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jewelrySubtype"
              rules={{ required: 'Please select a jewelry item type' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jewelry Item</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                <SelectValue placeholder="Select jewelry item" />
              </SelectTrigger>
                    </FormControl>
              <SelectContent>
                {subtypes.map((subtype) => (
                  <SelectItem key={subtype} value={subtype.toLowerCase()}>
                    {subtype}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          {jewelryType === "gold" && (
              <FormField
                control={form.control}
                name="karat"
                rules={{ required: 'Please select the karat value' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Karat</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                  <SelectValue placeholder="Select karat" />
                </SelectTrigger>
                      </FormControl>
                <SelectContent>
                  <SelectItem value="24">24K</SelectItem>
                  <SelectItem value="22">22K</SelectItem>
                  <SelectItem value="18">18K</SelectItem>
                  <SelectItem value="14">14K</SelectItem>
                </SelectContent>
              </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {jewelryType === "gold" && (
              <FormField
                control={form.control}
                name="purity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purity (fineness)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        readOnly
                        className="bg-muted"
                        max={999}
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-calculated based on karat (max 999 fineness)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="weight"
              rules={{ required: 'Weight is required', min: { value: 0.1, message: 'Weight must be at least 0.1' } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({jewelryType === "diamond" ? "carats" : "grams"})</FormLabel>
            <div className="flex items-center gap-4">
              <Slider
                min={1}
                max={jewelryType === "diamond" ? 10 : 100}
                step={jewelryType === "diamond" ? 0.1 : 1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                className="flex-1"
              />
                    <FormControl>
              <Input
                type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                className="w-20"
              />
                    </FormControl>
            </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sagName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Gold Necklace, Diamond Ring" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sagDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief description of the item" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., C-12345" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
            <textarea
                      {...field}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide any additional details about your jewelry (e.g., brand, age, condition)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="space-y-4">
          <Label>Jewelry Images</Label>
          <p className="text-sm text-muted-foreground">
            Upload clear images of your jewelry from multiple angles for accurate AI assessment.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <Card key={index}>
                <CardContent className="p-2">
                  <div className="relative w-full h-32">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Jewelry ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {images.length < 4 && (
              <Card>
                <CardContent className="p-2 flex flex-col items-center justify-center h-32">
                  <Button variant="outline" onClick={handleImageUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">{4 - images.length} more required</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImageUpload} disabled={images.length >= 4}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button variant="outline" onClick={handleImageUpload} disabled={images.length >= 4}>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>

          <Button
            onClick={handleScan}
            className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4"
            disabled={images.length < 1 || scanning || scanComplete}
          >
            {scanning ? "Scanning..." : scanComplete ? "Scan Complete" : "Scan Jewelry"}
          </Button>

          {scanComplete && aiAssessment && (
            <div className="space-y-3 mt-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-emerald-800">AI Assessment Complete</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Estimated Value:</span>
                      <span className="font-semibold">RM {estimatedValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Potential Financing:</span>
                      <span className="font-semibold">RM {Math.round(estimatedValue * 0.75).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">LTV Ratio:</span>
                      <span className="font-semibold">{(aiAssessment.ltv * 100).toFixed(2)}%</span>
                    </div>
                    {aiAssessment.purity && (
                      <div className="flex justify-between">
                        <span className="text-sm">Purity:</span>
                        <span className="font-semibold">{aiAssessment.purity}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Risk Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant="outline" className={
                        aiAssessment.risk_level === 'VERY_LOW' || aiAssessment.risk_level === 'LOW' 
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : aiAssessment.risk_level === 'MEDIUM'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : aiAssessment.risk_level === 'HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }>
                        {aiAssessment.risk_level.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Recommended Action:</span>
                      <Badge variant="outline" className={
                        aiAssessment.action === 'approve'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : aiAssessment.action === 'monitor'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }>
                        <span className="flex items-center gap-1">
                          {aiAssessment.action === 'approve' && <Check className="h-3 w-3" />}
                          {aiAssessment.action === 'monitor' && <Eye className="h-3 w-3" />}
                          {aiAssessment.action === 'margin_call' && <AlertTriangle className="h-3 w-3" />}
                          {aiAssessment.action.split('_').join(' ').toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 whitespace-pre-line">{aiAssessment.rationale}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      Evaluation ID: {aiAssessment.eval_id}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Note: Final valuation will be determined after physical assessment.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save Draft</Button>
        <Button 
          onClick={() => {
            // Pass submission data to next step
            if (submissionId && aiAssessment) {
              const formData = form.getValues()
              
              // Store jewelry data in sessionStorage for loan offer page
              sessionStorage.setItem('jewelrySubmissionId', submissionId)
              sessionStorage.setItem('estimatedValue', estimatedValue.toString())
              sessionStorage.setItem('jewelryType', formData.jewelryType)
              sessionStorage.setItem('jewelrySubtype', formData.jewelrySubtype)
              sessionStorage.setItem('weight', formData.weight.toString())
              sessionStorage.setItem('karat', formData.karat)
              sessionStorage.setItem('purity', formData.purity.toString())
              sessionStorage.setItem('additionalDetails', formData.additionalDetails)
              sessionStorage.setItem('sagName', formData.sagName)
              sessionStorage.setItem('sagDescription', formData.sagDescription)
              sessionStorage.setItem('certNo', formData.certNo)
              sessionStorage.setItem('jewelryImages', JSON.stringify(images))
              
              // Store AI risk analysis data
              sessionStorage.setItem('ltv', aiAssessment.ltv.toString())
              sessionStorage.setItem('risk_level', aiAssessment.risk_level)
              sessionStorage.setItem('rationale', aiAssessment.rationale)
              sessionStorage.setItem('action', aiAssessment.action)
              sessionStorage.setItem('eval_id', aiAssessment.eval_id)
              if (aiAssessment.purity) {
                sessionStorage.setItem('aiPurity', aiAssessment.purity.toString())
              }
            }
            nextStep()
          }}
          className="bg-emerald-600 hover:bg-emerald-700" 
          disabled={!scanComplete}
        >
          Continue to Loan Configuration
        </Button>
      </div>
    </div>
    </Form>
  )
}
