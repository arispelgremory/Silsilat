"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/hooks/use-language"

export function Header() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          {/* <Logo /> */}
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.home")}
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.aboutUs")}
            </Link>
            <Link href="/how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.howItWorks")}
            </Link>
            <Link href="/ar-rahnu-industry" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.arRahnuIndustry")}
            </Link>
            <Link href="/faq" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.faq")}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t("nav.contact")}
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="ghost" className="h-8 w-8 px-0 md:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
          <nav className="flex items-center space-x-2">
            <LanguageToggle />
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">{t("nav.admin")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/apply">{t("nav.applyNow")}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
