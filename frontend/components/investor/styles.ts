// Shared styling constants for investor pages
export const investorStyles = {
  // Layout
  pageContainer: "space-y-6 p-6",
  
  // Colors - Primary theme colors
  colors: {
    primary: "emerald-600",
    primaryHover: "emerald-700",
    secondary: "emerald-50",
    accent: "gold",
    accentHover: "gold/90",
    text: {
      primary: "emerald-800",
      secondary: "emerald-700",
      muted: "muted-foreground"
    }
  },
  
  // Cards
  card: {
    base: "shadow-sm border border-emerald-100 hover:shadow-md transition-shadow",
    interactive: "shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer",
    header: "border-b border-emerald-50"
  },
  
  // Buttons
  button: {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    secondary: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200",
    accent: "bg-gold hover:bg-gold/90 text-emerald-800"
  },
  
  // Badges and Status
  badge: {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200"
  },
  
  // Grids and spacing
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    stats: "grid grid-cols-1 md:grid-cols-3 gap-4",
    twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  },
  
  // Typography
  text: {
    pageTitle: "text-3xl font-bold text-emerald-800",
    sectionTitle: "text-xl font-semibold text-emerald-800",
    cardTitle: "text-lg font-semibold text-emerald-800",
    description: "text-muted-foreground",
    value: "text-2xl font-bold text-emerald-800",
    accent: "text-gold font-semibold"
  },
  
  // Backgrounds
  background: {
    page: "bg-gradient-to-br from-emerald-50/30 to-gold-50/30 min-h-full",
    card: "bg-white",
    accent: "bg-emerald-50",
    success: "bg-emerald-50",
    warning: "bg-amber-50"
  },
  
  // Borders and dividers
  border: {
    light: "border-emerald-100",
    medium: "border-emerald-200",
    divider: "border-t border-emerald-100"
  }
} as const

// Utility function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
