import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentMethods } from "@/components/payment/payment-methods"
import { PaymentHistory } from "@/components/payment/payment-history"
import { AutoPayment } from "@/components/payment/auto-payment"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PaymentPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Payment Center</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Make payments, view payment history, and set up automatic payments for your financing.
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Due Soon</AlertTitle>
        <AlertDescription>
          Your next payment of RM 1,250 is due on April 15, 2025. Please ensure your account has sufficient funds.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="make-payment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="make-payment">Make Payment</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="auto-payment">Auto Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="make-payment">
          <Card>
            <CardHeader>
              <CardTitle>Make a Payment</CardTitle>
              <CardDescription>Choose your preferred payment method to make a payment.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethods />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your payment history and upcoming payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto-payment">
          <Card>
            <CardHeader>
              <CardTitle>Auto Payment Setup</CardTitle>
              <CardDescription>Set up automatic payments to avoid missing due dates.</CardDescription>
            </CardHeader>
            <CardContent>
              <AutoPayment />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
