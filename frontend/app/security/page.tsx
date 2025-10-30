export default function SecurityPage() {
  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Security</h1>
        <p className="text-xl text-muted-foreground mb-8">How we protect your information and transactions</p>

        <div className="prose max-w-none">
          <p className="lead">
            At Silsilat, the security of your information and transactions is our highest priority. We employ
            advanced security measures and follow industry best practices to ensure that your data and financial
            transactions are protected at all times.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Protection Measures</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Encryption</h3>
          <p>We use industry-standard encryption technologies to protect your data:</p>
          <ul className="list-disc pl-6 my-4">
            <li>256-bit SSL/TLS encryption for all data in transit</li>
            <li>AES-256 encryption for sensitive data at rest</li>
            <li>End-to-end encryption for secure communications</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Secure Infrastructure</h3>
          <p>Our platform is built on a secure infrastructure that includes:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Cloud services with ISO 27001, SOC 1, SOC 2, and PCI DSS compliance</li>
            <li>Regular security patching and updates</li>
            <li>Network segregation and firewalls</li>
            <li>Intrusion detection and prevention systems</li>
            <li>24/7 monitoring for suspicious activities</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Transaction Security</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Secure Payment Processing</h3>
          <p>
            All financial transactions on our platform are processed through secure payment gateways that adhere to the
            highest security standards:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>PCI DSS compliant payment processing</li>
            <li>Tokenization of payment information</li>
            <li>Multi-factor authentication for high-value transactions</li>
            <li>Real-time fraud detection systems</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Transaction Verification</h3>
          <p>We implement multiple layers of verification for all transactions:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Identity verification before transaction approval</li>
            <li>Transaction confirmation via secure channels</li>
            <li>Anomaly detection to identify unusual transaction patterns</li>
            <li>Transaction limits and controls</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Account Security</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Authentication</h3>
          <p>We implement robust authentication mechanisms to protect your account:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Strong password requirements</li>
            <li>Multi-factor authentication (MFA)</li>
            <li>Biometric authentication options (for supported devices)</li>
            <li>Automatic session timeouts</li>
            <li>Account activity monitoring</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Access Controls</h3>
          <p>Our platform implements strict access controls:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Role-based access controls (RBAC)</li>
            <li>Principle of least privilege for all system access</li>
            <li>Detailed audit logs of all actions</li>
            <li>Regular access reviews</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Compliance and Certifications</h2>
          <p>We adhere to relevant security frameworks and standards:</p>
          <ul className="list-disc pl-6 my-4">
            <li>ISO 27001 (Information Security Management)</li>
            <li>PDPA (Personal Data Protection Act) compliance</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Compliance with financial regulatory requirements</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Security Practices in our Organization</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">Security Team</h3>
          <p>We have a dedicated security team responsible for:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Continuous monitoring of security systems</li>
            <li>Responding to security incidents</li>
            <li>Implementing security improvements</li>
            <li>Conducting security awareness training</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Employee Security</h3>
          <p>Our employees follow strict security protocols:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Background checks for all employees</li>
            <li>Regular security awareness training</li>
            <li>Secure access to systems and data</li>
            <li>Clean desk policy and physical security measures</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Your Role in Security</h2>
          <p>While we implement robust security measures, your participation in security is also important:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Use strong, unique passwords for your account</li>
            <li>Enable multi-factor authentication</li>
            <li>Keep your login credentials confidential</li>
            <li>Be vigilant against phishing attempts</li>
            <li>Report any suspicious activities to our security team</li>
            <li>Keep your contact information updated</li>
            <li>Regularly review your account activity</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Security Incident Response</h2>
          <p>In the unlikely event of a security incident:</p>
          <ul className="list-disc pl-6 my-4">
            <li>We have a comprehensive incident response plan</li>
            <li>Our team will immediately investigate and contain the incident</li>
            <li>Affected users will be promptly notified</li>
            <li>We will work with relevant authorities if necessary</li>
            <li>We will implement measures to prevent similar incidents</li>
          </ul>

          <div className="my-8 p-6 bg-emerald-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Our Security Commitment</h3>
            <p>
              Security is not a one-time effort but a continuous process of improvement. We are committed to
              continuously enhancing our security measures to protect your information and maintain your trust.
            </p>
          </div>

          <p>
            If you have any questions or concerns about our security practices, or if you want to report a security
            vulnerability, please contact our security team at{" "}
            <a href="mailto:security@silsilat.finance" className="text-emerald-600 hover:underline">
              security@silsilat.finance
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
