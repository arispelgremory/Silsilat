"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      id: "general",
      title: "General Questions",
      faqs: [
        {
          question: "What is Silsilat Platform?",
          answer:
            "Silsilat is a platform that connects Ar-Rahnu operators with Shariah-compliant funders, allowing them to expand their capacity to serve more customers effectively. Our platform serves as a bridge between those seeking ethical financing solutions and those looking to invest in Shariah-compliant opportunities.",
        },
        {
          question: "How does Silsilat ensure Shariah compliance?",
          answer:
            "We have a dedicated Shariah advisory board that oversees all of our operations and financing models. Every aspect of our platform, from the type of contracts used to the profits distributed, is carefully reviewed to ensure strict adherence to Islamic financial principles, including the prohibition of riba (interest).",
        },
        {
          question: "Who can use the Silsilat Platform?",
          answer:
            "Our platform serves two main user groups: Ar-Rahnu Operators (AROs) who are seeking to raise funds to expand their operations, and Short Term Funders who are looking to make Shariah-compliant investments. We welcome both individuals and organizations that share our commitment to Islamic finance principles.",
        },
      ],
    },
    {
      id: "ar-rahnu",
      title: "Ar-Rahnu Services",
      faqs: [
        {
          question: "What is Ar-Rahnu?",
          answer:
            "Ar-Rahnu is an Islamic pawnbroking service that allows individuals to use their gold or jewelry as collateral to obtain short-term financing. Unlike conventional pawning, Ar-Rahnu operates according to Shariah principles, charging a safekeeping fee rather than interest on the loan, making it a halal alternative for those seeking quick access to funds.",
        },
        {
          question: "How is Ar-Rahnu different from conventional pawnbroking?",
          answer:
            "Ar-Rahnu differs from conventional pawnbroking in several key ways: it operates under Shariah principles, doesn't charge interest (riba), typically offers a higher loan-to-value ratio, provides better safekeeping of pledged items, and offers more transparent and fair terms to customers. The relationship is based on mutual trust and ethical treatment rather than exploitation.",
        },
        {
          question: "What types of jewelry can be used for financing?",
          answer:
            "Typically, gold jewelry and gold bars/coins of various karats (18K, 22K, 24K) can be used as collateral. Some Ar-Rahnu operators may also accept other precious metals or stones, but gold is the most commonly accepted item due to its stable value and ease of assessment.",
        },
      ],
    },
    {
      id: "platform",
      title: "Platform Operations",
      faqs: [
        {
          question: "How do I register as an Ar-Rahnu Operator on the platform?",
          answer:
            "To register as an Ar-Rahnu Operator, visit our website and click on the 'Apply Now' button. You'll need to provide your business details, operational history, necessary licenses, and undergo our verification process. Our team will guide you through the onboarding process and help you set up your profile on the platform.",
        },
        {
          question: "How do funders connect with Ar-Rahnu operators?",
          answer:
            "Funders can browse through verified Ar-Rahnu operators on our platform, review their profiles, performance metrics, and funding opportunities. Once they identify operators they'd like to fund, they can initiate contact through our secure messaging system and proceed with the funding process as per the terms agreed upon.",
        },
        {
          question: "What security measures are in place to protect transactions?",
          answer:
            "We implement bank-grade security measures including encryption, secure payment gateways, two-factor authentication, regular security audits, and comprehensive data protection policies. All transactions are recorded and traceable, providing transparency and security for both operators and funders.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Support",
      faqs: [
        {
          question: "How can I reset my password?",
          answer:
            "To reset your password, click on the 'Forgot Password' link on the login page. Enter your registered email address, and you'll receive a password reset link. Follow the instructions in the email to create a new password. If you don't receive the email, please check your spam folder or contact our support team for assistance.",
        },
        {
          question: "What should I do if I encounter technical issues on the platform?",
          answer:
            "If you experience any technical issues, please try refreshing the page or clearing your browser cache. If the problem persists, contact our technical support team through the 'Help' section in your account dashboard or email support@silsilat.finance with details of the issue you're experiencing, including screenshots if possible.",
        },
        {
          question: "Is the platform accessible on mobile devices?",
          answer:
            "Yes, Silsilat platform is fully responsive and optimized for mobile devices. You can access all features and functionalities through your smartphone or tablet browser without any loss of functionality. For the best experience, ensure your device's operating system and browser are updated to the latest version.",
        },
      ],
    },
  ]

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : faqCategories

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground">
          Find answers to common questions about Silsilat and our services
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for questions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category) => (
            <div key={category.id} className={category.faqs.length > 0 ? "mb-8" : "hidden"}>
              <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left font-medium py-4">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find any FAQs matching your search. Please try different keywords or browse our categories.
            </p>
            <Button onClick={() => setSearchQuery("")} className="bg-emerald-600 hover:bg-emerald-700">
              Clear Search
            </Button>
          </div>
        )}

        <div className="bg-emerald-50 p-8 rounded-xl text-center mt-12">
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className="mb-4 text-muted-foreground">
            If you couldn&apos;t find the answer you were looking for, please contact our support team.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/contact">Contact Us</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
