export default function ShariahPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Shariah Compliance</h1>
        <p className="text-xl text-muted-foreground mb-8">Our commitment to Islamic financial principles</p>

        <div className="prose max-w-none">
          <p className="lead">
            At Silsilat, Shariah compliance is at the core of everything we do. We are committed to ensuring that
            all our operations, services, and transactions strictly adhere to Islamic financial principles. This page
            outlines our approach to Shariah compliance and the measures we take to maintain it.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Shariah Governance Framework</h2>
          <p>
            Our Shariah governance framework is designed to ensure that all aspects of our business are conducted in
            accordance with Islamic principles. This framework includes:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>
              <strong>Shariah Advisory Board:</strong> We have established a board of respected scholars specializing in
              Islamic jurisprudence and finance who provide guidance and oversight on all aspects of our operations.
            </li>
            <li>
              <strong>Shariah Compliance Department:</strong> A dedicated team responsible for implementing the
              recommendations of the Shariah Advisory Board and ensuring day-to-day compliance.
            </li>
            <li>
              <strong>Regular Shariah Audits:</strong> Independent reviews of our operations, transactions, and
              documentation to ensure ongoing compliance with Shariah principles.
            </li>
            <li>
              <strong>Continuous Education:</strong> Regular training for our staff on Islamic financial principles and
              their practical application in our business.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Islamic Financial Principles We Uphold</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Prohibition of Riba (Interest)</h3>
          <p>
            We strictly prohibit any form of interest-based transactions. All our financing models are structured to
            avoid riba, using Shariah-compliant alternatives such as:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>
              <strong>Qard Hasan (Interest-free loan):</strong> In Ar-Rahnu, the principal component of the financing is
              considered an interest-free loan.
            </li>
            <li>
              <strong>Ujrah (Fee-based):</strong> We charge a safekeeping fee for storing the collateral, not interest
              on the loan amount.
            </li>
            <li>
              <strong>Wadiah (Safekeeping):</strong> The jewelry or assets pledged are held in trust as collateral, with
              the owner retaining ownership rights.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Avoidance of Gharar (Excessive Uncertainty)</h3>
          <p>
            We ensure that all terms, conditions, and pricing are clear, transparent, and agreed upon upfront to avoid
            any excessive uncertainty or ambiguity that could lead to disputes.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Prohibition of Maysir (Gambling/Speculation)</h3>
          <p>
            Our platform does not support speculative activities. All transactions are asset-backed and based on real
            economic activities.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">Ethical Investments and Activities</h3>
          <p>
            We ensure that all transactions and investments facilitated through our platform are ethically sound and
            comply with Shariah principles. We avoid involvement with businesses dealing in prohibited goods and
            services such as alcohol, pork, gambling, adult entertainment, and other non-halal activities.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Ar-Rahnu Structure</h2>
          <p>Our Ar-Rahnu model is structured to comply with Shariah principles in the following ways:</p>
          <ol className="list-decimal pl-6 my-4">
            <li>
              <strong>Qard (Loan):</strong> The principal amount provided to the customer is considered a benevolent
              loan (Qard Hasan).
            </li>
            <li>
              <strong>Rahn (Pledge):</strong> The customer pledges jewelry or precious metals as security for the loan.
            </li>
            <li>
              <strong>Wadiah (Safekeeping):</strong> The pledged item is kept safely by the Ar-Rahnu operator throughout
              the financing period.
            </li>
            <li>
              <strong>Ujrah (Fee):</strong> A safekeeping fee is charged for the storage and security of the pledged
              item, based on its value, not the loan amount.
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Certification and Compliance</h2>
          <p>
            Our Shariah compliance is certified by recognized authorities in Islamic finance. We maintain regular
            reviews and audits to ensure ongoing compliance with the latest interpretations and standards in Islamic
            financial practices.
          </p>
          <p>
            Additionally, we work closely with regulatory bodies to ensure that our operations not only meet Shariah
            requirements but also comply with relevant financial regulations.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Transparency in Operations</h2>
          <p>We are committed to transparency in all our operations. This includes:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Clear disclosure of all fees and charges</li>
            <li>Transparent contract terms and conditions</li>
            <li>Regular reporting on Shariah compliance</li>
            <li>Open communication about our Shariah governance processes</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Continuous Improvement</h2>
          <p>
            Islamic finance is a dynamic field with ongoing scholarly discussions and interpretations. We are committed
            to continuous learning and improvement in our Shariah compliance practices. We regularly review and update
            our policies, procedures, and products to align with the latest developments in Islamic financial thought.
          </p>

          <div className="my-8 p-6 bg-emerald-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Our Shariah Commitment</h3>
            <p>
              At Silsilat, we believe that adherence to Shariah principles not only fulfills our religious
              obligations but also creates a more ethical, transparent, and sustainable financial ecosystem. We are
              dedicated to serving the needs of our community while upholding the highest standards of Islamic financial
              practices.
            </p>
          </div>

          <p>
            If you have any questions or require further clarification about our Shariah compliance practices, please
            don&apos;t hesitate to{" "}
            <a href="/contact" className="text-emerald-600 hover:underline">
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
