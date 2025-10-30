"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpCircle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import apiInstance from "@/lib/axios-v1"
import { toast } from "sonner"

const PRESET_AMOUNTS = [100, 500, 1000, 5000, 10000]

export function TopUpDialog() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const handlePresetClick = (value: number) => {
    setAmount(value.toString())
  }

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid amount greater than 0",
      })
      return
    }

    setIsLoading(true)

    const response = apiInstance.post('/investor/token/top-up', {
      amount: parseFloat(amount)
    })

    toast.promise(response, {
      loading: 'Topping up...',
      success: async () => {
        setAmount("")
        setOpen(false)
        await queryClient.refetchQueries({ queryKey: ['wallet-balance'] })
        return `RM ${parseFloat(amount).toFixed(2)} has been added to your wallet.`
      },
      error: 'Failed to top up wallet. Please try again.',
      finally: () => {
        setIsLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          Top Up Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your wallet. Choose a preset amount or enter a custom amount.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="grid gap-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                >
                  RM {preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">
              <strong>Total:</strong> RM {amount ? parseFloat(amount).toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setOpen(false)
              setAmount("")
            }}
          >
            Cancel
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" type="submit" onClick={handleTopUp} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Top Up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

