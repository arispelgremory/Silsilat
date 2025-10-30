import { enhancedKnowledgeBase } from "./enhanced-knowledge-base"
import { websiteSearch } from "./website-search"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  links?: { text: string; url: string }[]
  goldPrice?: {
    value: number
    unit: string
    currency: string
    timestamp: string
  }
}

type EnhancedResponse = {
  text: string
  links?: { text: string; url: string }[]
  goldPrice?: {
    value: number
    unit: string
    currency: string
    timestamp: string
  }
}

// Function to fetch current gold price in Malaysia
async function fetchGoldPrice(): Promise<{
  value: number
  unit: string
  currency: string
  timestamp: string
} | null> {
  try {
    // In a real implementation, this would call an actual API
    // For demo purposes, we're returning mock data

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock gold price data
    return {
      value: 305.67, // Malaysian Ringgit per gram
      unit: "gram",
      currency: "MYR",
      timestamp: new Date().toLocaleString("en-MY", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    // Real implementation would look something like:
    // const response = await fetch('https://api.goldprice.org/malaysia')
    // const data = await response.json()
    // return {
    //   value: data.price_per_gram_myr,
    //   unit: "gram",
    //   currency: "MYR",
    //   timestamp: new Date(data.timestamp).toLocaleString()
    // }
  } catch (error) {
    console.error("Error fetching gold price:", error)
    return null
  }
}

// Function to analyze user query and determine intent
function analyzeQuery(query: string): {
  intent: string
  keywords: string[]
  needsGoldPrice: boolean
  needsWebsiteSearch: boolean
} {
  const lowerQuery = query.toLowerCase()

  // Define intents and their related keywords
  const intents = {
    goldPrice: [
      "gold price",
      "gold rate",
      "current price",
      "market rate",
      "gold value",
      "price per gram",
      "karat",
      "carat",
    ],
    loanInfo: ["loan", "financing", "borrow", "ar-rahnu", "pawning", "collateral", "jewelry"],
    accountIssue: ["account", "login", "password", "sign in", "register", "profile"],
    walletIssue: ["wallet", "payment", "transfer", "hedera", "hbar", "connect", "disconnect"],
    paymentTimeline: ["payment", "schedule", "due date", "repayment", "installment", "tenure", "monthly"],
    generalInfo: ["how", "what", "when", "where", "why", "who", "can", "do"],
  }

  // Determine primary intent
  let primaryIntent = "generalInfo"
  let maxMatches = 0

  for (const [intent, keywords] of Object.entries(intents)) {
    const matches = keywords.filter((keyword) => lowerQuery.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      primaryIntent = intent
    }
  }

  // Extract keywords
  const allKeywords = Object.values(intents).flat()
  const foundKeywords = allKeywords.filter((keyword) => lowerQuery.includes(keyword))

  // Determine if we need gold price
  const needsGoldPrice =
    primaryIntent === "goldPrice" ||
    (primaryIntent === "loanInfo" && foundKeywords.some((k) => ["gold", "price", "value", "rate"].includes(k)))

  // Determine if we need website search
  const needsWebsiteSearch = query.length > 10 && !query.includes("?")

  return {
    intent: primaryIntent,
    keywords: foundKeywords,
    needsGoldPrice,
    needsWebsiteSearch,
  }
}

// Function to generate a chat response based on user input and conversation history
export async function generateEnhancedResponse(query: string, history: Message[]): Promise<EnhancedResponse> {
  // Analyze the query
  const analysis = analyzeQuery(query)

  // Initialize response object
  const response: EnhancedResponse = {
    text: "",
    links: [],
  }

  // Fetch gold price if needed
  if (analysis.needsGoldPrice) {
    const goldPrice = await fetchGoldPrice()
    if (goldPrice) {
      response.goldPrice = goldPrice
    }
  }

  // Search website content if needed
  let websiteResults: { text: string; url: string }[] = []
  if (analysis.needsWebsiteSearch) {
    websiteResults = await websiteSearch(query, analysis.keywords)
  }

  // Check knowledge base for relevant information
  let knowledgeBaseAnswer = ""
  for (const item of enhancedKnowledgeBase) {
    // Check if any keywords match
    if (analysis.keywords.some((keyword) => item.keywords.includes(keyword))) {
      knowledgeBaseAnswer = item.response

      // Add links if available
      if (item.links && item.links.length > 0) {
        response.links = [...(response.links || []), ...item.links]
      }

      break
    }
  }

  // Generate response text based on intent and available information
  switch (analysis.intent) {
    case "goldPrice":
      if (response.goldPrice) {
        response.text = `The current gold price in Malaysia is ${response.goldPrice.value} ${response.goldPrice.currency} per ${response.goldPrice.unit}. This rate affects the financing amount you can receive when using gold jewelry as collateral. For our Ar-Rahnu service, we typically offer 70-80% of the assessed gold value as financing.`
      } else {
        response.text =
          "I'm unable to fetch the current gold price at the moment. Our financing rates for gold jewelry are typically 70-80% of the current market value. For the most accurate and up-to-date pricing, please contact our customer service or visit one of our branches."
      }
      break

    case "loanInfo":
      if (knowledgeBaseAnswer) {
        response.text = knowledgeBaseAnswer
      } else {
        response.text =
          "Our Shariah-compliant jewelry financing allows you to use your gold or precious jewelry as collateral for quick access to funds. The process involves jewelry assessment, creating a secure NFT representation of your collateral, and providing you with financing based on the assessed value. Would you like to know more about the application process, rates, or terms?"
      }
      break

    case "accountIssue":
      if (knowledgeBaseAnswer) {
        response.text = knowledgeBaseAnswer
      } else {
        response.text =
          "For account-related issues, you can log in through our secure portal. If you're experiencing login problems, you can reset your password using the 'Forgot Password' link on the login page. For security reasons, we may require additional verification for certain account changes. Is there a specific account issue you need help with?"
      }
      break

    case "walletIssue":
      if (knowledgeBaseAnswer) {
        response.text = knowledgeBaseAnswer
      } else {
        response.text =
          "We support Hedera wallets for receiving financing and making repayments. You can connect your existing Hedera wallet or set up a new one during the application process. If you're experiencing issues with your wallet connection, please ensure you have the latest wallet software and try reconnecting. For persistent issues, please contact our technical support team."
      }
      break

    case "paymentTimeline":
      if (knowledgeBaseAnswer) {
        response.text = knowledgeBaseAnswer
      } else {
        response.text =
          "Our financing terms typically range from 3 to 12 months, with flexible repayment options. You can make payments through your Hedera wallet, bank transfer, or other supported payment methods. Payment schedules are clearly outlined in your financing agreement, and you'll receive reminders before each due date. You can also set up automatic payments to avoid missing deadlines."
      }
      break

    default:
      if (knowledgeBaseAnswer) {
        response.text = knowledgeBaseAnswer
      } else if (websiteResults.length > 0) {
        // Use website search results
        response.text = "Based on your question, here's what I found on our website:"
        response.links = websiteResults.map((result) => ({
          text: result.text,
          url: result.url,
        }))
      } else {
        response.text =
          "I don't have specific information about that, but I'd be happy to connect you with our team who can help. You can contact us at frank@unitedalliedbusiness.com or call  during business hours."
      }
  }

  // Add website search results as links if not already included
  if (websiteResults.length > 0 && (!response.links || response.links.length === 0)) {
    response.links = websiteResults.map((result) => ({
      text: result.text,
      url: result.url,
    }))
  }

  // Ensure we don't have duplicate links
  if (response.links && response.links.length > 0) {
    const uniqueLinks: { text: string; url: string }[] = []
    const seenUrls = new Set()

    for (const link of response.links) {
      if (!seenUrls.has(link.url)) {
        uniqueLinks.push(link)
        seenUrls.add(link.url)
      }
    }

    response.links = uniqueLinks.slice(0, 3) // Limit to 3 links to avoid overwhelming the user
  }

  return response
}
