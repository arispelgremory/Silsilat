"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "my"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.aboutUs": "About Us",
    "nav.howItWorks": "How It Works",
    "nav.arRahnuIndustry": "Ar-Rahnu Industry",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.admin": "Admin",
    "nav.applyNow": "Apply Now",
    "nav.pawnshop": "Pawnshop",

    // Admin Sidebar
    "admin.dashboard": "Dashboard Overview",
    "admin.kyc": "KYC Verification",
    "admin.sag": "SAG Listings",
    "admin.repayment": "Repayment & Settlement",
    "admin.extensions": "Loan Extensions",
    "admin.defaults": "Default Cases",
    "admin.investors": "Investor Management",
    "admin.branches": "Ar Rahnu Branches",
    "admin.wallets": "Wallet & Token Control",
    "admin.compliance": "Compliance & Risk",
    "admin.analytics": "Analytics & Reports",
    "admin.settings": "System Settings",
    "admin.notifications": "Notifications",
    "admin.support": "Support Desk",
    "admin.tools": "Admin Tools",
    "admin.backToMain": "Back to Main Site",
    "admin.logout": "Logout",

    // AI Risk & Compliance
    "ai.riskCompliance": "AI Risk & Compliance",
    "ai.kycAml": "KYC & AML Intelligence",
    "ai.sagRisk": "SAG Risk Evaluation",
    "ai.walletMonitoring": "Wallet Monitoring",
    "ai.defaultPrediction": "Default Prediction",
    "ai.complianceBot": "Compliance Assistant",
    "ai.reporting": "Automated Reporting",
    "ai.auditLogs": "Audit Logs",
    "ai.explainableAi": "Explainable AI",
    "ai.biasControl": "Bias Control",

    // KYC & AML
    "kyc.documentIntelligence": "Document Intelligence",
    "kyc.livenessVerification": "Liveness Verification",
    "kyc.amlScanning": "AML Watchlist Scanning",
    "kyc.behaviorScoring": "Behavior Risk Scoring",
    "kyc.continuousMonitoring": "Continuous Monitoring",
    "kyc.riskScore": "Risk Score",
    "kyc.status": "KYC Status",
    "kyc.lastScan": "Last Scan",
    "kyc.nextReview": "Next Review",

    // SAG Risk
    "sag.riskEvaluation": "Risk Evaluation",
    "sag.raiseRatio": "Raise vs Collateral Ratio",
    "sag.patternDelay": "Pattern of Delay",
    "sag.underSubscription": "Token Under-subscription",
    "sag.repeatedExtensions": "Repeated Extensions",
    "sag.realTimeScore": "Real-Time Risk Score",
    "sag.riskLevel": "Risk Level",
    "sag.lowRisk": "Low Risk",
    "sag.moderateRisk": "Moderate Risk",
    "sag.highRisk": "High Risk",

    // Wallet Monitoring
    "wallet.velocityAlert": "Velocity Alert",
    "wallet.riskDrift": "Risk Drift",
    "wallet.branchAbuse": "Branch Abuse",
    "wallet.watchlistHit": "Watchlist Hit",
    "wallet.customAlert": "Custom Alert",
    "wallet.flagged": "Flagged",
    "wallet.monitoring": "Monitoring",
    "wallet.alerts": "Alerts",

    // Default Prediction
    "default.earlyWarning": "Early Warning Model",
    "default.riskOutput": "Risk Score Output",
    "default.autoTagging": "Automatic Tagging",
    "default.impactSimulation": "Impact Simulation",
    "default.recommendations": "Compliance Recommendations",
    "default.likelihood": "Default Likelihood",
    "default.affectedInvestors": "Affected Investors",

    // Compliance Bot
    "bot.complianceAssistant": "Compliance Assistant",
    "bot.naturalLanguage": "Natural Language Queries",
    "bot.askQuestion": "Ask a compliance question...",
    "bot.examples": "Example queries:",
    "bot.listFlagged": "List all investors flagged in May",
    "bot.walletHistory": "What's the risk history for wallet 0x123...",
    "bot.generateReport": "Generate AML compliance report for March",
    "bot.tokenBurned": "Why was this token burned late?",
    "bot.overdueListings": "Show overdue listings by branch with history",

    // Reporting
    "report.automated": "Automated Reporting",
    "report.kycCompliance": "KYC Compliance Report",
    "report.amlSummary": "AML Summary",
    "report.tokenLifecycle": "Token Lifecycle Report",
    "report.listingQuality": "Listing Quality Report",
    "report.generate": "Generate Report",
    "report.download": "Download PDF",
    "report.schedule": "Schedule Report",

    // Audit & Explainability
    "audit.logs": "Audit Logs",
    "audit.decision": "AI Decision",
    "audit.timestamp": "Timestamp",
    "audit.inputs": "AI Inputs",
    "audit.explanation": "Explanation",
    "audit.confidence": "Confidence",
    "audit.override": "Manual Override",
    "audit.justification": "Justification",
    "audit.digitalSignature": "Digital Signature",

    // Common
    "common.search": "Search...",
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.pending": "Pending",
    "common.approved": "Approved",
    "common.rejected": "Rejected",
    "common.high": "High",
    "common.medium": "Medium",
    "common.low": "Low",
  },
  my: {
    // Navigation
    "nav.home": "Laman Utama",
    "nav.aboutUs": "Tentang Kami",
    "nav.howItWorks": "Cara Kerja",
    "nav.arRahnuIndustry": "Industri Ar-Rahnu",
    "nav.faq": "Soalan Lazim",
    "nav.contact": "Hubungi",
    "nav.login": "Log Masuk",
    "nav.admin": "Pentadbir",
    "nav.applyNow": "Mohon Sekarang",

    // Admin Sidebar
    "admin.dashboard": "Papan Pemuka",
    "admin.kyc": "Pengesahan KYC",
    "admin.sag": "Senarai SAG",
    "admin.repayment": "Bayaran & Penyelesaian",
    "admin.extensions": "Lanjutan Pinjaman",
    "admin.defaults": "Kes Mungkir",
    "admin.investors": "Pengurusan Pelabur",
    "admin.branches": "Cawangan Ar Rahnu",
    "admin.wallets": "Kawalan Dompet & Token",
    "admin.compliance": "Pematuhan & Risiko",
    "admin.analytics": "Analitik & Laporan",
    "admin.settings": "Tetapan Sistem",
    "admin.notifications": "Pemberitahuan",
    "admin.support": "Meja Bantuan",
    "admin.tools": "Alat Pentadbir",
    "admin.backToMain": "Kembali ke Laman Utama",
    "admin.logout": "Log Keluar",

    // AI Risk & Compliance
    "ai.riskCompliance": "AI Risiko & Pematuhan",
    "ai.kycAml": "Kecerdasan KYC & AML",
    "ai.sagRisk": "Penilaian Risiko SAG",
    "ai.walletMonitoring": "Pemantauan Dompet",
    "ai.defaultPrediction": "Ramalan Mungkir",
    "ai.complianceBot": "Pembantu Pematuhan",
    "ai.reporting": "Pelaporan Automatik",
    "ai.auditLogs": "Log Audit",
    "ai.explainableAi": "AI Boleh Dijelaskan",
    "ai.biasControl": "Kawalan Bias",

    // KYC & AML
    "kyc.documentIntelligence": "Kecerdasan Dokumen",
    "kyc.livenessVerification": "Pengesahan Kehidupan",
    "kyc.amlScanning": "Imbasan Senarai Pantau AML",
    "kyc.behaviorScoring": "Pemarkahan Risiko Tingkah Laku",
    "kyc.continuousMonitoring": "Pemantauan Berterusan",
    "kyc.riskScore": "Skor Risiko",
    "kyc.status": "Status KYC",
    "kyc.lastScan": "Imbasan Terakhir",
    "kyc.nextReview": "Semakan Seterusnya",

    // SAG Risk
    "sag.riskEvaluation": "Penilaian Risiko",
    "sag.raiseRatio": "Nisbah Raise vs Cagaran",
    "sag.patternDelay": "Corak Kelewatan",
    "sag.underSubscription": "Token Kurang Langganan",
    "sag.repeatedExtensions": "Lanjutan Berulang",
    "sag.realTimeScore": "Skor Risiko Masa Nyata",
    "sag.riskLevel": "Tahap Risiko",
    "sag.lowRisk": "Risiko Rendah",
    "sag.moderateRisk": "Risiko Sederhana",
    "sag.highRisk": "Risiko Tinggi",

    // Wallet Monitoring
    "wallet.velocityAlert": "Amaran Halaju",
    "wallet.riskDrift": "Hanyutan Risiko",
    "wallet.branchAbuse": "Penyalahgunaan Cawangan",
    "wallet.watchlistHit": "Terkena Senarai Pantau",
    "wallet.customAlert": "Amaran Tersuai",
    "wallet.flagged": "Dibenderakan",
    "wallet.monitoring": "Pemantauan",
    "wallet.alerts": "Amaran",

    // Default Prediction
    "default.earlyWarning": "Model Amaran Awal",
    "default.riskOutput": "Output Skor Risiko",
    "default.autoTagging": "Penandaan Automatik",
    "default.impactSimulation": "Simulasi Impak",
    "default.recommendations": "Cadangan Pematuhan",
    "default.likelihood": "Kemungkinan Mungkir",
    "default.affectedInvestors": "Pelabur Terjejas",

    // Compliance Bot
    "bot.complianceAssistant": "Pembantu Pematuhan",
    "bot.naturalLanguage": "Pertanyaan Bahasa Semula Jadi",
    "bot.askQuestion": "Tanya soalan pematuhan...",
    "bot.examples": "Contoh pertanyaan:",
    "bot.listFlagged": "Senaraikan semua pelabur yang dibenderakan pada bulan Mei",
    "bot.walletHistory": "Apakah sejarah risiko untuk dompet 0x123...",
    "bot.generateReport": "Jana laporan pematuhan AML untuk Mac",
    "bot.tokenBurned": "Mengapa token ini dibakar lewat?",
    "bot.overdueListings": "Tunjukkan senarai tertunggak mengikut cawangan dengan sejarah",

    // Reporting
    "report.automated": "Pelaporan Automatik",
    "report.kycCompliance": "Laporan Pematuhan KYC",
    "report.amlSummary": "Ringkasan AML",
    "report.tokenLifecycle": "Laporan Kitaran Hayat Token",
    "report.listingQuality": "Laporan Kualiti Senarai",
    "report.generate": "Jana Laporan",
    "report.download": "Muat Turun PDF",
    "report.schedule": "Jadualkan Laporan",

    // Audit & Explainability
    "audit.logs": "Log Audit",
    "audit.decision": "Keputusan AI",
    "audit.timestamp": "Cap Masa",
    "audit.inputs": "Input AI",
    "audit.explanation": "Penjelasan",
    "audit.confidence": "Keyakinan",
    "audit.override": "Override Manual",
    "audit.justification": "Justifikasi",
    "audit.digitalSignature": "Tandatangan Digital",

    // Common
    "common.search": "Cari...",
    "common.loading": "Memuatkan...",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.edit": "Edit",
    "common.delete": "Padam",
    "common.view": "Lihat",
    "common.status": "Status",
    "common.actions": "Tindakan",
    "common.active": "Aktif",
    "common.inactive": "Tidak Aktif",
    "common.pending": "Menunggu",
    "common.approved": "Diluluskan",
    "common.rejected": "Ditolak",
    "common.high": "Tinggi",
    "common.medium": "Sederhana",
    "common.low": "Rendah",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "en" || saved === "my")) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
