// Simulated website search functionality
// In a real implementation, this would connect to a search API or database

type SearchResult = {
  text: string
  url: string
  relevance: number
}

// Website content mapping for search
const websiteContent: {
  url: string
  title: string
  content: string
  keywords: string[]
}[] = [
  {
    url: "/apply",
    title: "Apply for Financing",
    content:
      "Complete our simple application process to get Shariah-compliant financing using your jewelry as collateral. Our process involves KYC verification, jewelry submission, wallet connection, and financing disbursement.",
    keywords: ["apply", "financing", "application", "process", "jewelry", "collateral"],
  },
  {
    url: "/login",
    title: "Login to Your Account",
    content:
      "Access your Silsilat account to manage your financing, make payments, and track your collateral status.",
    keywords: ["login", "account", "sign in", "access", "dashboard"],
  },
  {
    url: "/register",
    title: "Create an Account",
    content:
      "Register for a Silsilat account to apply for Shariah-compliant jewelry financing and access our services.",
    keywords: ["register", "account", "sign up", "create account"],
  },
  {
    url: "/payment",
    title: "Payment Center",
    content:
      "Make payments, view payment history, and set up automatic payments for your financing. We offer multiple payment methods including Hedera wallet, bank transfer, and credit/debit card.",
    keywords: ["payment", "repayment", "pay", "schedule", "history", "automatic"],
  },
  {
    url: "/dashboard",
    title: "User Dashboard",
    content:
      "Manage your financing, view your collateral status, make payments, and access your account information all in one place.",
    keywords: ["dashboard", "account", "manage", "overview", "status"],
  },
  {
    url: "/ar-rahnu-industry",
    title: "Ar-Rahnu Industry",
    content:
      "Learn about the Islamic pawnbroking ecosystem and how Ar-Rahnu provides Shariah-compliant financing solutions using gold and jewelry as collateral.",
    keywords: ["ar-rahnu", "islamic", "shariah", "pawnbroking", "gold", "jewelry"],
  },
  {
    url: "/faq",
    title: "Frequently Asked Questions",
    content:
      "Find answers to common questions about our Shariah-compliant jewelry financing services, account management, payment options, and more.",
    keywords: ["faq", "questions", "help", "support", "information"],
  },
  {
    url: "/terms",
    title: "Terms of Service",
    content:
      "Our terms of service outline the rules, guidelines, and agreements for using Silsilat's Shariah-compliant financing services.",
    keywords: ["terms", "service", "agreement", "rules", "guidelines"],
  },
  {
    url: "/privacy",
    title: "Privacy Policy",
    content:
      "Our privacy policy explains how we collect, use, and protect your personal information when you use our services.",
    keywords: ["privacy", "policy", "data", "information", "protection"],
  },
  {
    url: "/security",
    title: "Security Measures",
    content:
      "Learn about the security measures we implement to protect your information, transactions, and collateral when using our services.",
    keywords: ["security", "protection", "measures", "encryption", "safe"],
  },
  {
    url: "/contact",
    title: "Contact Us",
    content:
      "Get in touch with our team for any inquiries or support related to our Shariah-compliant jewelry financing services.",
    keywords: ["contact", "support", "help", "inquiries", "assistance"],
  },
]

// Function to search website content
export async function websiteSearch(query: string, queryKeywords: string[]): Promise<{ text: string; url: string }[]> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const results: SearchResult[] = []

  // Search through website content
  for (const page of websiteContent) {
    // Calculate relevance score based on keyword matches
    let relevance = 0

    // Check title match
    if (page.title.toLowerCase().includes(query.toLowerCase())) {
      relevance += 10
    }

    // Check content match
    if (page.content.toLowerCase().includes(query.toLowerCase())) {
      relevance += 5
    }

    // Check keyword matches
    for (const keyword of queryKeywords) {
      if (page.keywords.includes(keyword)) {
        relevance += 3
      }
    }

    // Add to results if relevant
    if (relevance > 0) {
      results.push({
        text: page.title,
        url: page.url,
        relevance,
      })
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevance - a.relevance)

  // Return top results
  return results.slice(0, 3).map((result) => ({
    text: result.text,
    url: result.url,
  }))
}
