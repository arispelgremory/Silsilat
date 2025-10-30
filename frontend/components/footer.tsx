import Link from "next/link"
import { Facebook, Instagram, Linkedin, LinkedinIcon, Twitter, X } from "lucide-react"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="bg-deepGreen text-ivory">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm">
              Providing Shariah-compliant jewelry financing solutions with transparency and trust. The preferred center
              for your liquidity needs.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/silsilatfinance" className="text-ivory/70 hover:text-brightGold">
                <X className="h-5 w-5" />
                <span className="sr-only">X</span>
              </a>
              <a href="https://www.linkedin.com/company/silsilat-finance" className="text-ivory/70 hover:text-brightGold">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-brightGold font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-brightGold">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brightGold">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/ar-rahnu-industry" className="hover:text-brightGold">
                  Ar-Rahnu Industry
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-brightGold">
                  Apply for Financing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brightGold">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brightGold">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-brightGold font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-brightGold">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brightGold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shariah" className="hover:text-brightGold">
                  Shariah Compliance
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-brightGold">
                  Security
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gold/20 mt-12 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Silsilat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
