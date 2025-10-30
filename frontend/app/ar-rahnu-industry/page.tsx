import Image from "next/image"

export default function ArRahnuIndustryPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Ar-Rahnu Industry</h1>
        <p className="text-xl text-muted-foreground">Understanding the Islamic pawnbroking ecosystem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">What is Ar-Rahnu?</h2>
          <p className="mb-6 text-muted-foreground">
            Ar-Rahnu is an Islamic pawnbroking service that provides Shariah-compliant short-term financing to
            individuals and businesses. It allows customers to pledge their gold or precious jewelry as collateral for a
            cash loan, without charging interest, which is prohibited in Islamic finance.
          </p>
          <p className="mb-6 text-muted-foreground">
            The word &quot;Ar-Rahnu&quot; comes from Arabic, meaning &quot;pawning&quot; or &quot;collateral.&quot; This financial instrument is based
            on the Islamic principles of Qard (interest-free loan), Rahn (collateral), Wadiah (safekeeping), and Ujrah
            (safekeeping fee).
          </p>
          <p className="text-muted-foreground">
            Unlike conventional pawnshops that charge interest, Ar-Rahnu operators charge a safekeeping fee based on the
            value of the collateral rather than the loan amount, making it compliant with Islamic law.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-50"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-400 rounded-full opacity-30"></div>
          <div className="relative bg-white rounded-xl shadow-xl overflow-hidden h-full min-h-[400px]">
            <Image
              src="/placeholder.svg?height=400&width=500"
              alt="Ar-Rahnu Gold Financing"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">How Ar-Rahnu Works</h2>
        <div className="relative">
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-emerald-600 mb-4 z-10">
                <span className="text-emerald-600 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Appraisal</h3>
              <p className="text-gray-600">
                The customer brings gold jewelry or precious metals to an Ar-Rahnu operator for valuation by certified
                appraisers.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-emerald-600 mb-4 z-10">
                <span className="text-emerald-600 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Financing</h3>
              <p className="text-gray-600">
                The operator offers a loan (typically 60-80% of the item&apos;s value) as Qard Hasan (interest-free loan).
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-emerald-600 mb-4 z-10">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safekeeping</h3>
              <p className="text-gray-600">
                The jewelry is kept securely by the operator, who charges a safekeeping fee (Ujrah) based on the item&apos;s
                value.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-emerald-600 mb-4 z-10">
                <span className="text-emerald-600 font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Redemption</h3>
              <p className="text-gray-600">
                The customer repays the loan amount plus the safekeeping fee to reclaim their jewelry within the agreed
                period.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Benefits of Ar-Rahnu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Customers</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Shariah-compliant financing option</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Quick access to cash in emergencies</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>No interest charges or hidden fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Higher loan-to-value ratio than conventional pawnshops</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Safe storage of valuable items</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>No impact on credit history</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Operators</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Stable business model with secured lending</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Attractive profit margins through safekeeping fees</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Growing market demand from Muslim communities</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Lower risk compared to unsecured lending</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Contribution to financial inclusion</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For the Economy</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Enhanced financial inclusion for unbanked populations</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Circulation of idle gold assets in the economy</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Reduced reliance on informal lending channels</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Support for micro-enterprises and small businesses</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Growth of the Islamic financial ecosystem</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Ar-Rahnu Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Global Landscape</h3>
            <p className="text-muted-foreground mb-4">
              The global Ar-Rahnu market has been growing steadily, particularly in countries with significant Muslim
              populations. Malaysia leads as the most developed Ar-Rahnu market, followed by Brunei, Indonesia,
              Singapore, and Middle Eastern countries.
            </p>
            <p className="text-muted-foreground">
              The increasing demand for Shariah-compliant financial products and growing awareness of Islamic finance
              principles have contributed to the expansion of Ar-Rahnu services worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Malaysian Market</h3>
            <p className="text-muted-foreground mb-4">
              Malaysia&apos;s Ar-Rahnu industry has evolved significantly since its inception in the 1990s. The market
              includes a diverse range of operators, from Islamic banks and cooperatives to dedicated Ar-Rahnu
              institutions.
            </p>
            <p className="text-muted-foreground">
              The industry is well-regulated under Bank Negara Malaysia and the Malaysia Co-operative Societies
              Commission, providing a stable and trustworthy environment for both operators and customers.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Challenges and Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3">Industry Challenges</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Limited funding sources for Ar-Rahnu operators</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Competition from conventional pawnshops</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Fluctuating gold prices affecting collateral values</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Operational costs of secure storage and insurance</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Need for standardization of practices across operators</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Limited public awareness in some markets</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Digital transformation and online Ar-Rahnu services</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Expansion into new markets with Muslim populations</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Integration with broader Islamic financial ecosystems</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Product diversification beyond gold collateral</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Partnership with fintech companies</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-600 mr-2">•</span>
                <span>Access to Shariah-compliant funding through platforms like Silsilat</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">How Silsilat Supports the Ar-Rahnu Industry</h2>
        <p className="max-w-3xl mx-auto text-muted-foreground mb-6">
          Silsilat connects Ar-Rahnu operators with Shariah-compliant funders, helping operators expand their
          capacity to serve more customers. Our platform addresses one of the key challenges in the industry: access to
          capital for growth and sustainability.
        </p>
        <div className="max-w-xl mx-auto">
          <a
            href="/apply"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Join Silsilat Platform
          </a>
        </div>
      </div>
    </div>
  )
}
