import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock,
  Shield,
  Upload,
  Lock,
  TrendingUp,
  Eye,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoanCalculator } from "@/components/loan-calculator"
import { HowItWorks } from "@/components/how-it-works"
import { Testimonials } from "@/components/testimonials"
import { InvestorDashboard } from "@/components/investor-dashboard"
import { TokenPurchaseTrackerProvider } from "@/components/token-purchase-tracker-provider"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-deepGreen py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-ivory mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shariah-Compliant Jewelry Financing</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Secure, transparent, and ethical financing solutions backed by your valuable jewelry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-brightGold hover:bg-gold text-deepGreen">
                <Link href="/apply">Apply for Financing</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-gold text-gold hover:bg-gold/10 bg-transparent"
              >
                <Link href="#calculator">Calculate Your Offer</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold/30 rounded-full"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold/20 rounded-full"></div>
              <div className="relative bg-deepGreen rounded-xl shadow-xl overflow-hidden border border-gold/30">
                <Image
                  src="/images/home-hero.webp"
                  alt="Shariah-Compliant Jewelry Financing"
                  width={500}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Why Choose Silsilat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-gold/20">
              <CardHeader>
                <Shield className="h-10 w-10 text-gold mb-2" />
                <CardTitle className="text-deepGreen">Shariah-Compliant</CardTitle>
                <CardDescription>All our financing solutions adhere to Islamic financial principles.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our financing model is based on ethical principles that ensure fair and transparent transactions
                  without interest (riba).
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-gold mb-2" />
                <CardTitle className="text-deepGreen">Secure NFT Collateral</CardTitle>
                <CardDescription>
                  Your jewelry is digitally represented as a secure NFT on the Hedera network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  We create a digital representation of your jewelry as a non-transferable NFT, ensuring security and
                  transparency.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gold/20">
              <CardHeader>
                <Clock className="h-10 w-10 text-gold mb-2" />
                <CardTitle className="text-deepGreen">Quick Approval</CardTitle>
                <CardDescription>Get your financing approved and disbursed within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our AI-powered appraisal system evaluates your jewelry quickly, allowing for fast financing decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section id="calculator" className="py-16 bg-ivory">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-deepGreen">Calculate Your Financing</h2>
              <p className="text-lg mb-8 text-darkOlive">
                Use our calculator to estimate how much financing you can receive based on your jewelry&apos;s value.
              </p>
              <div className="flex items-center gap-4 mb-8">
                <Calculator className="h-12 w-12 text-gold" />
                <div>
                  <h3 className="font-semibold text-lg text-deepGreen">Instant Estimation</h3>
                  <p className="text-darkOlive">Get an immediate estimate of your financing amount.</p>
                </div>
              </div>
              <Button asChild className="bg-brightGold hover:bg-gold text-deepGreen">
                <Link href="/apply" className="flex items-center gap-2">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2 w-full">
              <Card className="w-full border-gold/20">
                <CardHeader className="border-b border-gold/10">
                  <CardTitle className="text-deepGreen">Financing Calculator</CardTitle>
                  <CardDescription>Estimate your financing amount based on your jewelry details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoanCalculator />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">How It Works</h2>
          <HowItWorks />
        </div>
      </section>

      {/* Risk & Mitigation Table */}
      <section className="py-16 bg-ivory">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Risk & Mitigation</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-deepGreen text-ivory">
                <tr>
                  <th className="p-4 text-left font-semibold">Risk</th>
                  <th className="p-4 text-left font-semibold">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gold/20">
                  <td className="p-4 font-medium text-red-600">Ar Rahnu default</td>
                  <td className="p-4 text-darkOlive">Institutional repayment mandate enforced</td>
                </tr>
                <tr className="border-b border-gold/20 bg-softBeige/50">
                  <td className="p-4 font-medium text-red-600">Investor dissatisfaction</td>
                  <td className="p-4 text-darkOlive">Daily interest visibility, secure payout</td>
                </tr>
                <tr className="border-b border-gold/20">
                  <td className="p-4 font-medium text-red-600">Token mismanagement</td>
                  <td className="p-4 text-darkOlive">Burn upon settlement, immutable history</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-red-600">Legal non-compliance</td>
                  <td className="p-4 text-darkOlive">Centralized KYC + LegalOps review</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Investor Dashboard */}
      <InvestorDashboard />

    

      {/* Compliance & Security */}
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Compliance & Security</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">Institutional KYC</h3>
              <p className="text-darkOlive text-sm">Comprehensive identity verification for all participants</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">Hedera Audit Logs</h3>
              <p className="text-darkOlive text-sm">Immutable transaction history on Hedera network</p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">Profit Auto-tracking</h3>
              <p className="text-darkOlive text-sm">Automated daily profit calculation and distribution</p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">NFT Burn After Completion</h3>
              <p className="text-darkOlive text-sm">Automatic token and NFT destruction upon settlement</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">Immutable Transaction History</h3>
              <p className="text-darkOlive text-sm">Permanent record of all transactions and operations</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-deepGreen mb-2">Multi-layer Security</h3>
              <p className="text-darkOlive text-sm">Enterprise-grade security protocols and encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-ivory">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">What Our Customers Say</h2>
          <Testimonials />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-deepGreen text-ivory">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Apply for Shariah-compliant financing today and receive funds within 24 hours.
          </p>
          <Button asChild size="lg" className="bg-brightGold hover:bg-gold text-deepGreen">
            <Link href="/apply">Apply Now</Link>
          </Button>
        </div>
      </section>

      {/* Token Purchase Progress Tracker */}
      <TokenPurchaseTrackerProvider />
    </div>
  )
}
