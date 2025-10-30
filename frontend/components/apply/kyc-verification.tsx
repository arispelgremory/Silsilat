"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Check, FileText, Upload, User } from "lucide-react"

interface KYCVerificationProps {
  nextStep: () => void;
}

export function KYCVerification({ nextStep }: KYCVerificationProps) {
  const [step, setStep] = useState(1)
  const [idType, setIdType] = useState("myKad")
  const [idNumber, setIdNumber] = useState("")
  const [idFrontUploaded, setIdFrontUploaded] = useState(false)
  const [idBackUploaded, setIdBackUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("--step-1-completed") === "true") {
      console.log("Step 1 completed")
      setStep(3);
      setSelfieUploaded(true);
      setIdFrontUploaded(true);
      setIdBackUploaded(true);
      setVerificationComplete(true);
    }
  }, []);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
      setVerificationComplete(false);
    } else {
      // Simulate verification process
      setVerificationComplete(true);
      localStorage.setItem("--step-1-completed", "true")
      nextStep();
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleIdUpload = (side: "front" | "back") => {
    if (side === "front") {
      setIdFrontUploaded(true)
    } else {
      setIdBackUploaded(true)
    }
  }

  const handleSelfieUpload = () => {
    setSelfieUploaded(true)
  }

  return (
    <div className="space-y-6">
      <Tabs value={`step-${step}`} className="w-full">
        {/* <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="step-1" onClick={() => setStep(1)}>
            Personal Information
          </TabsTrigger>
          <TabsTrigger value="step-2" onClick={() => setStep(2)}>
            ID Verification
          </TabsTrigger>
          <TabsTrigger value="step-3" onClick={() => setStep(3)}>
            Facial Verification
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="step-1" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder="Enter your first name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Enter your last name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="Enter your phone number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Enter your address" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Enter your city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" placeholder="Enter your state" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal-code">Postal Code</Label>
              <Input id="postal-code" placeholder="Enter your postal code" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700">
              Next Step
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="step-2" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID Type</Label>
              <RadioGroup value={idType} onValueChange={setIdType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="myKad" id="myKad" />
                  <Label htmlFor="myKad">MyKad (Malaysian ID)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="passport" id="passport" />
                  <Label htmlFor="passport">Passport</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id-number">{idType === "myKad" ? "MyKad Number" : "Passport Number"}</Label>
              <Input
                id="id-number"
                placeholder={idType === "myKad" ? "e.g., 901231-14-5581" : "e.g., A12345678"}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded-md border-2 border-dashed border-gray-300">
                      {idFrontUploaded ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-10 w-10 text-green-500" />
                          <p className="text-sm text-gray-500">Front uploaded</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileText className="h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-500">Front of ID</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => handleIdUpload("front")} disabled={idFrontUploaded}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Front
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded-md border-2 border-dashed border-gray-300">
                      {idBackUploaded ? (
                        <div className="flex flex-col items-center">
                          <Check className="h-10 w-10 text-green-500" />
                          <p className="text-sm text-gray-500">Back uploaded</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <FileText className="h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-500">Back of ID</p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => handleIdUpload("back")} disabled={idBackUploaded}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>
              Previous Step
            </Button>
            <Button
              onClick={handleNextStep}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!idFrontUploaded || !idBackUploaded || !idNumber}
            >
              Next Step
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="step-3" className="space-y-4 pt-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-md border-2 border-dashed border-gray-300">
                    {selfieUploaded ? (
                      <div className="flex flex-col items-center">
                        <Check className="h-16 w-16 text-green-500" />
                        <p className="text-sm text-gray-500">Selfie uploaded</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <User className="h-16 w-16 text-gray-400" />
                        <p className="text-sm text-gray-500">Take a selfie or upload a photo</p>
                        <p className="text-xs text-gray-400 mt-2">Make sure your face is clearly visible</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSelfieUpload} disabled={selfieUploaded}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <Button variant="outline" onClick={handleSelfieUpload} disabled={selfieUploaded}>
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>

                  {selfieUploaded && !verificationComplete && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">Our AI system is verifying your identity...</p>
                    </div>
                  )}

                  {verificationComplete && (
                    <div className="text-center mt-4 space-y-2">
                      <div className="flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="font-medium text-green-600">Verification Successful!</p>
                      <p className="text-sm text-gray-500">
                        Your identity has been verified. You can now proceed to the next step.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>
              Previous Step
            </Button>
            <Button onClick={handleNextStep} className="bg-emerald-600 hover:bg-emerald-700" disabled={!selfieUploaded}>
              {verificationComplete ? "Complete Verification" : "Verify Identity"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
