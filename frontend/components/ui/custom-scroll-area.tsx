import type React from "react"
import { cn } from "@/lib/utils"

interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function CustomScrollArea({ className, children, ...props }: CustomScrollAreaProps) {
  return (
    <div className={cn("relative overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}
