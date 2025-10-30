import { HowItWorks } from "@/components/how-it-works"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-50 to-gold-50 py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get financing for your jewelry through our innovative Shariah-compliant platform. 
              Our AI-powered system makes the process simple, secure, and transparent.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-emerald-200">
              <span className="text-sm font-medium text-emerald-700">✨ Powered by Hedera Blockchain</span>
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-800 mb-4">
                Simple Steps to Get Financing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these easy steps to turn your jewelry into instant liquidity
              </p>
            </div>
            <HowItWorks />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-emerald-50 py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-800 mb-4">
                Why Choose Our Platform?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">Shariah Compliant</h3>
                <p className="text-muted-foreground">Fully compliant with Islamic finance principles and regulations</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">Fast & Secure</h3>
                <p className="text-muted-foreground">AI-powered assessment with blockchain security for quick processing</p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">NFT Collateral</h3>
                <p className="text-muted-foreground">Your jewelry becomes a digital asset with transparent ownership</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}