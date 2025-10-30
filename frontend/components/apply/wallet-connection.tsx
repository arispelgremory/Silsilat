"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Check, ExternalLink, Wallet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function WalletConnection() {
  const [connectionMethod, setConnectionMethod] = useState("hedera")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  })

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setConnectionError("")

    try {
      // Simulate wallet connection process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful connection
      setWalletConnected(true)
      setWalletAddress("0.0.12345")
    } catch (error) {
      setConnectionError("Failed to connect wallet. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectWallet = () => {
    setWalletConnected(false)
    setWalletAddress("")
    setConnectionError("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Disbursement Method</Label>
        <RadioGroup value={connectionMethod} onValueChange={setConnectionMethod} className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hedera" id="hedera" />
            <Label htmlFor="hedera">Hedera Wallet (HBAR)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank">Bank Transfer</Label>
          </div>
        </RadioGroup>
      </div>

      {connectionMethod === "hedera" ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Hedera Wallet</CardTitle>
            <CardDescription>Connect your Hedera wallet to receive financing and make repayments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{connectionError}</AlertDescription>
              </Alert>
            )}

            {walletConnected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-emerald-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Wallet Connected</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <Input value={walletAddress} readOnly className="font-mono" />
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wallet Balance</Label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">HBAR</span>
                      <span className="font-bold text-emerald-600">100.00</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">≈ $30.00 USD</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-medium text-lg">No Wallet Connected</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your Hedera wallet to proceed with your financing application.
                  </p>
                </div>
                <Button
                  onClick={handleConnectWallet}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </div>
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          {walletConnected && (
            <CardFooter>
              <Button variant="outline" onClick={handleDisconnectWallet} className="w-full bg-transparent">
                Disconnect Wallet
              </Button>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>Provide your bank account details for financing disbursement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Holder Name</Label>
              <Input
                id="account-name"
                placeholder="Enter account holder name"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="Enter account number"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="Enter bank name"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between gap-2">
        <Button variant="outline">Previous Step</Button>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={
            connectionMethod === "hedera"
              ? !walletConnected
              : !bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName
          }
        >
          Continue to Next Step
        </Button>
      </div>
    </div>
  )
}
