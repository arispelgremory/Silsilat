"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Check, FileText, Upload, User } from "lucide-react"

export default function KycVerificationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Personal Information
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    dateOfBirth: "",
    nationality: "Malaysia",
  })

  // ID Verification
  const [idType, setIdType] = useState("myKad")
  const [idNumber, setIdNumber] = useState("")
  const [idFrontUploaded, setIdFrontUploaded] = useState(false)
  const [idBackUploaded, setIdBackUploaded] = useState(false)

  // Facial Verification
  const [selfieUploaded, setSelfieUploaded] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    })
  }

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Simulate verification process
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setVerificationComplete(true)
      }, 2000)
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

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container max-w-4xl py-10 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Complete your identity verification to access all features of Silsilat.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > 1 ? <Check className="h-6 w-6" /> : "1"}
              </div>
              <span className="mt-2 text-sm font-medium">Personal Info</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > 2 ? <Check className="h-6 w-6" /> : "2"}
              </div>
              <span className="mt-2 text-sm font-medium">ID Verification</span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  step >= 3 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {verificationComplete ? <Check className="h-6 w-6" /> : "3"}
              </div>
              <span className="mt-2 text-sm font-medium">Facial Verification</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? "Personal Information" : step === 2 ? "ID Verification" : "Facial Verification"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Provide your personal details"
              : step === 2
                ? "Upload your identification documents"
                : "Complete facial verification for security"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={personalInfo.address}
                  onChange={handlePersonalInfoChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter your city"
                    value={personalInfo.city}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter your state"
                    value={personalInfo.state}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    placeholder="Enter your postal code"
                    value={personalInfo.postalCode}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select
                    value={personalInfo.nationality}
                    onValueChange={(value) => setPersonalInfo({ ...personalInfo, nationality: value })}
                  >
                    <SelectTrigger id="nationality">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Malaysia">Malaysia</SelectItem>
                      <SelectItem value="Singapore">Singapore</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                      <SelectItem value="Thailand">Thailand</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
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
          )}

          {step === 3 && (
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
                          Your identity has been verified. You can now proceed to your dashboard.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handlePrevStep}>
              Previous Step
            </Button>
          ) : (
            <div></div>
          )}

          {verificationComplete ? (
            <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={
                (step === 1 &&
                  (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email || !personalInfo.phone)) ||
                (step === 2 && (!idNumber || !idFrontUploaded || !idBackUploaded)) ||
                (step === 3 && !selfieUploaded) ||
                isLoading
              }
            >
              {isLoading ? "Processing..." : step === 3 ? "Complete Verification" : "Next Step"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
