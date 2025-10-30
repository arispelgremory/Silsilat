import type React from "react"
import type { UserMode } from "./types"

interface BotResponse {
  text: string
  actions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
    variant?: "default" | "outline" | "destructive"
  }>
  data?: any
}

export class SuyulaBotService {
  private sagData = [
    { id: "10293", duration: "6 months", profit: 6.2, subscribed: 78, status: "active", amount: 50000 },
    { id: "10294", duration: "12 months", profit: 8.5, subscribed: 45, status: "active", amount: 75000 },
    { id: "10295", duration: "3 months", profit: 4.8, subscribed: 92, status: "active", amount: 25000 },
    { id: "10296", duration: "9 months", profit: 7.2, subscribed: 23, status: "active", amount: 100000 },
  ]

  private portfolioData = {
    totalInvestment: 15000,
    currentValue: 16850,
    profit: 1850,
    investments: [
      { sagId: "10293", amount: 5000, currentValue: 5620, profit: 620 },
      { sagId: "10294", amount: 10000, currentValue: 11230, profit: 1230 },
    ],
  }

  async processMessage(message: string, userMode: UserMode, language: string, history: any[]): Promise<BotResponse> {
    const lowerMessage = message.toLowerCase()

    // Auto-detect language and switch context
    const isMalay = this.detectMalayLanguage(message)
    const lang = isMalay ? "my" : language

    // Process based on user mode and intent
    const intent = this.detectIntent(lowerMessage, userMode)

    switch (intent) {
      case "show_listings":
        return this.handleShowListings(userMode, lang)

      case "check_portfolio":
        return this.handleCheckPortfolio(userMode, lang)

      case "calculate_returns":
        return this.handleCalculateReturns(lowerMessage, lang)

      case "kyc_status":
        return this.handleKycStatus(userMode, lang)

      case "upload_sag":
        return this.handleUploadSag(userMode, lang)

      case "branch_limits":
        return this.handleBranchLimits(userMode, lang)

      case "system_status":
        return this.handleSystemStatus(userMode, lang)

      case "burn_token":
        return this.handleBurnToken(lowerMessage, userMode, lang)

      case "mint_token":
        return this.handleMintToken(lowerMessage, userMode, lang)

      case "overdue_listings":
        return this.handleOverdueListings(userMode, lang)

      case "platform_info":
        return this.handlePlatformInfo(lang)

      case "help":
        return this.handleHelp(userMode, lang)

      default:
        return this.handleGeneralQuery(message, userMode, lang)
    }
  }

  async handleQuickAction(action: string, userMode: UserMode, language: string): Promise<BotResponse> {
    switch (action) {
      case "show_listings":
        return this.handleShowListings(userMode, language)

      case "check_portfolio":
        return this.handleCheckPortfolio(userMode, language)

      case "calculate_returns":
        return {
          text:
            language === "my"
              ? "Sila beritahu saya jumlah pelaburan dan tempoh untuk mengira pulangan anda."
              : "Please tell me your investment amount and duration to calculate your returns.",
          actions: [{ label: language === "my" ? "Kalkulator ROI" : "ROI Calculator", action: "roi_calculator" }],
        }

      case "kyc_status":
        return this.handleKycStatus(userMode, language)

      case "upload_sag":
        return this.handleUploadSag(userMode, language)

      case "help_guide":
        return this.handleHelp(userMode, language)

      default:
        return {
          text:
            language === "my" ? "Maaf, saya tidak faham tindakan tersebut." : "Sorry, I don't understand that action.",
        }
    }
  }

  private detectIntent(message: string, userMode: UserMode): string {
    // SAG/Investment related
    if (message.includes("sag") || message.includes("listing") || message.includes("available")) {
      return "show_listings"
    }

    if (message.includes("portfolio") || message.includes("investment") || message.includes("my")) {
      return "check_portfolio"
    }

    if (message.includes("calculate") || message.includes("return") || message.includes("profit")) {
      return "calculate_returns"
    }

    if (message.includes("kyc") || message.includes("verification")) {
      return "kyc_status"
    }

    // Ar Rahnu specific
    if (message.includes("upload") && userMode === "arRahnu") {
      return "upload_sag"
    }

    if (message.includes("branch") || message.includes("limit")) {
      return "branch_limits"
    }

    // Admin specific
    if (message.includes("burn") && userMode === "admin") {
      return "burn_token"
    }

    if (message.includes("mint") && userMode === "admin") {
      return "mint_token"
    }

    if (message.includes("overdue") || message.includes("default")) {
      return "overdue_listings"
    }

    if (message.includes("system") || message.includes("status")) {
      return "system_status"
    }

    // General
    if (message.includes("what") || message.includes("suyula") || message.includes("platform")) {
      return "platform_info"
    }

    if (message.includes("help") || message.includes("guide")) {
      return "help"
    }

    return "general"
  }

  private detectMalayLanguage(message: string): boolean {
    const malayWords = ["saya", "apa", "bagaimana", "boleh", "tolong", "terima", "kasih", "maaf"]
    return malayWords.some((word) => message.toLowerCase().includes(word))
  }

  private handleShowListings(userMode: UserMode, language: string): BotResponse {
    const availableListings = this.sagData.filter((sag) => sag.subscribed < 100)

    return {
      text:
        language === "my"
          ? `Berikut adalah ${availableListings.length} SAG yang tersedia untuk pelaburan:`
          : `Here are ${availableListings.length} available SAGs for investment:`,
      data: {
        type: "sag_list",
        items: availableListings,
      },
      actions: [
        {
          label: language === "my" ? "Lihat Butiran" : "View Details",
          action: "view_sag_details",
        },
        {
          label: language === "my" ? "Kalkulator Pulangan" : "Calculate Returns",
          action: "calculate_returns",
        },
      ],
    }
  }

  private handleCheckPortfolio(userMode: UserMode, language: string): BotResponse {
    if (userMode === "guest") {
      return {
        text:
          language === "my" ? "Sila log masuk untuk melihat portfolio anda." : "Please log in to view your portfolio.",
        actions: [{ label: language === "my" ? "Log Masuk" : "Login", action: "login" }],
      }
    }

    return {
      text:
        language === "my"
          ? "Berikut adalah ringkasan portfolio pelaburan anda:"
          : "Here's your investment portfolio summary:",
      data: {
        type: "portfolio",
        ...this.portfolioData,
      },
      actions: [
        {
          label: language === "my" ? "Muat Turun Laporan" : "Download Report",
          action: "download_report",
        },
        {
          label: language === "my" ? "Lihat Butiran" : "View Details",
          action: "portfolio_details",
        },
      ],
    }
  }

  private handleCalculateReturns(message: string, language: string): BotResponse {
    // Extract numbers from message for calculation
    const amounts = message.match(/\d+/g)

    if (amounts && amounts.length >= 2) {
      const amount = Number.parseInt(amounts[0])
      const months = Number.parseInt(amounts[1])
      const estimatedReturn = amount * ((0.06 * months) / 12) // 6% annual return

      return {
        text:
          language === "my"
            ? `Berdasarkan pelaburan RM${amount} untuk ${months} bulan, anggaran pulangan anda adalah RM${estimatedReturn.toFixed(2)}.`
            : `Based on an investment of RM${amount} for ${months} months, your estimated return is RM${estimatedReturn.toFixed(2)}.`,
        actions: [
          {
            label: language === "my" ? "Lihat SAG Sesuai" : "View Suitable SAGs",
            action: "show_suitable_sags",
          },
        ],
      }
    }

    return {
      text:
        language === "my"
          ? "Sila nyatakan jumlah pelaburan dan tempoh (contoh: 'Saya ingin melabur RM5000 untuk 6 bulan')."
          : "Please specify your investment amount and duration (example: 'I want to invest RM5000 for 6 months').",
    }
  }

  private handleKycStatus(userMode: UserMode, language: string): BotResponse {
    if (userMode === "guest") {
      return {
        text:
          language === "my"
            ? "Sila daftar akaun untuk memulakan proses KYC."
            : "Please register an account to start the KYC process.",
        actions: [{ label: language === "my" ? "Daftar" : "Register", action: "register" }],
      }
    }

    // Mock KYC status
    const kycStatus = "approved" // or "pending", "rejected", "under_review"

    return {
      text:
        language === "my"
          ? `Status KYC anda: ${kycStatus === "approved" ? "Diluluskan" : "Menunggu"}. ${kycStatus === "approved" ? "Anda boleh mula melabur sekarang!" : "Dokumen anda sedang dalam semakan."}`
          : `Your KYC status: ${kycStatus === "approved" ? "Approved" : "Pending"}. ${kycStatus === "approved" ? "You can start investing now!" : "Your documents are under review."}`,
      actions:
        kycStatus !== "approved"
          ? [
              {
                label: language === "my" ? "Kemaskini Dokumen" : "Update Documents",
                action: "update_kyc",
              },
            ]
          : [
              {
                label: language === "my" ? "Mula Melabur" : "Start Investing",
                action: "show_listings",
              },
            ],
    }
  }

  private handleUploadSag(userMode: UserMode, language: string): BotResponse {
    if (userMode !== "arRahnu" && userMode !== "admin") {
      return {
        text:
          language === "my"
            ? "Maaf, hanya staf Ar Rahnu yang boleh memuat naik SAG."
            : "Sorry, only Ar Rahnu staff can upload SAGs.",
      }
    }

    return {
      text:
        language === "my"
          ? "Untuk memuat naik SAG baharu:\n1. Pastikan dokumen lengkap\n2. Tentukan peratusan raise (maksimum 80%)\n3. Tetapkan tempoh pinjaman\n4. Tunggu kelulusan maker-checker"
          : "To upload a new SAG:\n1. Ensure documents are complete\n2. Set raise percentage (maximum 80%)\n3. Set loan duration\n4. Wait for maker-checker approval",
      actions: [
        {
          label: language === "my" ? "Panduan Upload" : "Upload Guide",
          action: "upload_guide",
        },
        {
          label: language === "my" ? "Semak Status" : "Check Status",
          action: "check_upload_status",
        },
      ],
    }
  }

  private handleBranchLimits(userMode: UserMode, language: string): BotResponse {
    if (userMode !== "arRahnu" && userMode !== "admin") {
      return {
        text:
          language === "my"
            ? "Maklumat had cawangan hanya tersedia untuk staf Ar Rahnu."
            : "Branch limit information is only available for Ar Rahnu staff.",
      }
    }

    // Mock branch data
    const branchData = {
      name: "Cawangan Bangi",
      maxRaise: "80%",
      currentUtilization: "65%",
      availableLimit: "RM 350,000",
    }

    return {
      text:
        language === "my"
          ? `Had cawangan anda:\n• Cawangan: ${branchData.name}\n• Had maksimum raise: ${branchData.maxRaise}\n• Penggunaan semasa: ${branchData.currentUtilization}\n• Had tersedia: ${branchData.availableLimit}`
          : `Your branch limits:\n• Branch: ${branchData.name}\n• Maximum raise: ${branchData.maxRaise}\n• Current utilization: ${branchData.currentUtilization}\n• Available limit: ${branchData.availableLimit}`,
      actions: [
        {
          label: language === "my" ? "Lihat Butiran" : "View Details",
          action: "branch_details",
        },
      ],
    }
  }

  private handleSystemStatus(userMode: UserMode, language: string): BotResponse {
    const systemStatus = {
      platform: "Online",
      blockchain: "Connected",
      kyc: "Operational",
      payments: "Operational",
    }

    return {
      text:
        language === "my"
          ? `Status sistem:\n• Platform: ${systemStatus.platform}\n• Blockchain: ${systemStatus.blockchain}\n• KYC: ${systemStatus.kyc}\n• Pembayaran: ${systemStatus.payments}`
          : `System status:\n• Platform: ${systemStatus.platform}\n• Blockchain: ${systemStatus.blockchain}\n• KYC: ${systemStatus.kyc}\n• Payments: ${systemStatus.payments}`,
      actions:
        userMode === "admin"
          ? [
              {
                label: language === "my" ? "Laporan Terperinci" : "Detailed Report",
                action: "system_report",
              },
            ]
          : [],
    }
  }

  private handleBurnToken(message: string, userMode: UserMode, language: string): BotResponse {
    if (userMode !== "admin") {
      return {
        text:
          language === "my"
            ? "Maaf, hanya pentadbir yang boleh membakar token."
            : "Sorry, only admins can burn tokens.",
      }
    }

    const sagMatch = message.match(/sag #?(\d+)/i)
    const sagId = sagMatch ? sagMatch[1] : null

    if (sagId) {
      return {
        text:
          language === "my"
            ? `Token untuk SAG #${sagId} telah dibakar berjaya. Transaksi telah direkodkan di blockchain.`
            : `Token for SAG #${sagId} has been burned successfully. Transaction recorded on blockchain.`,
        actions: [
          {
            label: language === "my" ? "Lihat Transaksi" : "View Transaction",
            action: "view_burn_tx",
          },
        ],
      }
    }

    return {
      text:
        language === "my"
          ? "Sila nyatakan ID SAG untuk membakar token (contoh: 'Bakar token untuk SAG #1023')."
          : "Please specify the SAG ID to burn token (example: 'Burn token for SAG #1023').",
    }
  }

  private handleMintToken(message: string, userMode: UserMode, language: string): BotResponse {
    if (userMode !== "admin") {
      return {
        text:
          language === "my"
            ? "Maaf, hanya pentadbir yang boleh mencetak token."
            : "Sorry, only admins can mint tokens.",
      }
    }

    const sagMatch = message.match(/sag #?(\d+)/i)
    const sagId = sagMatch ? sagMatch[1] : null

    if (sagId) {
      return {
        text:
          language === "my"
            ? `Token untuk SAG #${sagId} telah dicetak berjaya. NFT telah dibuat di Hedera network.`
            : `Token for SAG #${sagId} has been minted successfully. NFT created on Hedera network.`,
        actions: [
          {
            label: language === "my" ? "Lihat NFT" : "View NFT",
            action: "view_nft",
          },
        ],
      }
    }

    return {
      text:
        language === "my"
          ? "Sila nyatakan ID SAG untuk mencetak token (contoh: 'Cetak token untuk SAG #1023')."
          : "Please specify the SAG ID to mint token (example: 'Mint token for SAG #1023').",
    }
  }

  private handleOverdueListings(userMode: UserMode, language: string): BotResponse {
    if (userMode !== "admin" && userMode !== "arRahnu") {
      return {
        text:
          language === "my"
            ? "Maklumat SAG tertunggak hanya tersedia untuk staf."
            : "Overdue SAG information is only available for staff.",
      }
    }

    const overdueListings = [
      { id: "10291", branch: "Bangi", daysOverdue: 15, amount: 25000 },
      { id: "10289", branch: "Shah Alam", daysOverdue: 8, amount: 15000 },
    ]

    return {
      text:
        language === "my"
          ? `Terdapat ${overdueListings.length} SAG tertunggak yang memerlukan tindakan segera.`
          : `There are ${overdueListings.length} overdue SAGs requiring immediate attention.`,
      data: {
        type: "overdue_list",
        items: overdueListings,
      },
      actions: [
        {
          label: language === "my" ? "Tindakan Pemulihan" : "Recovery Action",
          action: "recovery_action",
          variant: "destructive" as const,
        },
      ],
    }
  }

  private handlePlatformInfo(language: string): BotResponse {
    return {
      text:
        language === "my"
          ? "Suyula Liquid ialah platform tokenisasi emas yang mematuhi Shariah. Kami menghubungkan operator Ar-Rahnu dengan pelabur untuk menyediakan kecairan yang diperlukan sambil memastikan kepatuhan penuh kepada prinsip kewangan Islam."
          : "Suyula Liquid is a Shariah-compliant gold tokenization platform. We connect Ar-Rahnu operators with investors to provide needed liquidity while ensuring full compliance with Islamic finance principles.",
      actions: [
        {
          label: language === "my" ? "Cara Ia Berfungsi" : "How It Works",
          action: "how_it_works",
        },
        {
          label: language === "my" ? "Keselamatan" : "Security",
          action: "security_info",
        },
        {
          label: language === "my" ? "Mula Melabur" : "Start Investing",
          action: "start_investing",
        },
      ],
    }
  }

  private handleHelp(userMode: UserMode, language: string): BotResponse {
    const helpTopics = {
      investor: [
        { label: language === "my" ? "Cara Melabur" : "How to Invest", action: "invest_guide" },
        { label: language === "my" ? "Memahami SAG" : "Understanding SAGs", action: "sag_guide" },
        { label: language === "my" ? "Pengeluaran Dana" : "Withdrawals", action: "withdrawal_guide" },
      ],
      arRahnu: [
        { label: language === "my" ? "Upload SAG" : "Upload SAG", action: "upload_guide" },
        { label: language === "my" ? "Proses Kelulusan" : "Approval Process", action: "approval_guide" },
        { label: language === "my" ? "Lanjutan Pinjaman" : "Loan Extensions", action: "extension_guide" },
      ],
      admin: [
        { label: language === "my" ? "Pengurusan Token" : "Token Management", action: "token_guide" },
        { label: language === "my" ? "Laporan Sistem" : "System Reports", action: "report_guide" },
        { label: language === "my" ? "Pematuhan" : "Compliance", action: "compliance_guide" },
      ],
      guest: [
        { label: language === "my" ? "Pendaftaran" : "Registration", action: "register_guide" },
        { label: language === "my" ? "Proses KYC" : "K YC Process", action: "kyc_guide" },
        { label: language === "my" ? "Soalan Lazim" : "FAQ", action: "faq" },
      ],
    }

    return {
      text:
        language === "my"
          ? "Berikut adalah topik bantuan yang tersedia untuk anda:"
          : "Here are the help topics available for you:",
      actions: helpTopics[userMode] || helpTopics.guest,
    }
  }

  private handleGeneralQuery(message: string, userMode: UserMode, language: string): BotResponse {
    // Simple keyword matching for general queries
    if (message.toLowerCase().includes("contact") || message.toLowerCase().includes("support")) {
      return {
        text:
          language === "my"
            ? "Untuk bantuan lanjut, anda boleh menghubungi pasukan sokongan kami di support@suyula.com atau melalui WhatsApp di +60123456789."
            : "For further assistance, you can contact our support team at support@suyula.com or via WhatsApp at +60123456789.",
        actions: [
          {
            label: language === "my" ? "Buka Tiket Sokongan" : "Open Support Ticket",
            action: "create_ticket",
          },
        ],
      }
    }

    return {
      text:
        language === "my"
          ? "Maaf, saya tidak faham sepenuhnya pertanyaan anda. Boleh anda cuba bertanya dengan cara yang berbeza atau pilih dari topik bantuan di bawah?"
          : "I'm sorry, I don't fully understand your question. Could you try asking in a different way or choose from the help topics below?",
      actions: [
        {
          label: language === "my" ? "Topik Bantuan" : "Help Topics",
          action: "help_guide",
        },
        {
          label: language === "my" ? "Hubungi Sokongan" : "Contact Support",
          action: "contact_support",
        },
      ],
    }
  }
}
