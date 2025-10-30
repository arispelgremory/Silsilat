import { ReactNode } from 'react'
import { investorStyles } from './styles'

interface InvestorPageLayoutProps {
  children: ReactNode
  className?: string
}

export function InvestorPageLayout({ children, className = '' }: InvestorPageLayoutProps) {
  return (
    <div className={`${investorStyles.background.page} ${investorStyles.pageContainer} ${className}`}>
      {children}
    </div>
  )
}
