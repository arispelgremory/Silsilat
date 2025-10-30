import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About Silsilat</h1>
        <p className="text-xl text-muted-foreground">The Preferred Center for Your Liquidity Needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="mb-6 text-muted-foreground">
            Silsilat is a platform that connects Ar-Rahnu operators with Shariah-compliant funders, allowing them
            to expand their capacity to serve more customers effectively.
          </p>
          <p className="mb-6 text-muted-foreground">
            Our mission is to become the preferred center for liquidity needs by providing a comprehensive platform that
            connects Ar-Rahnu operators (AROs) and funders, creating a seamless ecosystem that benefits all participants
            in the Islamic financing space.
          </p>
          <p className="text-muted-foreground">
            Whether you&apos;re an Ar-Rahnu Operator seeking to raise funds or a Short Term Funder looking to make meaningful
            investments, Silsilat welcomes you to join our community of like-minded individuals and organizations
            committed to Islamic finance principles.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-50"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-400 rounded-full opacity-30"></div>
          <div className="relative bg-white rounded-xl shadow-xl overflow-hidden h-full min-h-[400px]">
            <Image
              src="/placeholder.svg?height=400&width=500"
              alt="Ar-Rahnu Financing"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Shariah Compliance</h3>
                <p className="text-muted-foreground">
                  We ensure all transactions and partnerships adhere strictly to Islamic financial principles, providing
                  peace of mind for both operators and funders.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  We believe in complete transparency in all operations, ensuring trust and confidence among all
                  participants in our ecosystem.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We continually innovate our platform and services to meet the evolving needs of Ar-Rahnu operators and
                  funders in the digital age.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Silsilat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Platform</h3>
              <p className="text-muted-foreground">
                A one-stop solution connecting Ar-Rahnu operators with Shariah-compliant funders, streamlining the
                entire funding process.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-muted-foreground">
                Advanced security measures to protect all transactions and personal information, ensuring peace of mind
                for all platform users.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Expanded Reach</h3>
              <p className="text-muted-foreground">
                Connect with a wider network of operators and funders, increasing opportunities for growth and
                collaboration within the Islamic finance community.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-muted-foreground">
                Access to a team of experts in Islamic finance and Ar-Rahnu operations, providing guidance and support
                throughout the platform experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-8 rounded-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Our Commitment</h2>
        <p className="text-center max-w-3xl mx-auto text-muted-foreground">
          At Silsilat, we are committed to providing the most reliable, transparent, and Shariah-compliant
          platform for Ar-Rahnu operators and funders. Our goal is to strengthen the Islamic finance ecosystem by
          facilitating meaningful connections and transactions that benefit all parties involved while adhering to the
          principles of Islamic finance.
        </p>
      </div>
    </div>
  )
}
