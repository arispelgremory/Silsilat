import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  variant?: "full" | "compact"
  className?: string
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/images/silsilat.jpg"
        alt="Silsilat Logo"
        width={variant === "full" ? 120 : 96}
        height={variant === "full" ? 40 : 32}
        className={variant === "full" ? "h-10 w-auto" : "h-8 w-auto"}
      />
    </Link>
  )
}
